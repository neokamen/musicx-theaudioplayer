use crate::models::{AudioTelemetry, PlaybackState};
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{Stream, StreamConfig};
use std::collections::VecDeque;
use std::fs::File;
use std::path::Path;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::mpsc::{channel, Receiver, Sender};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use symphonia::core::audio::{AudioBufferRef, Signal};
use symphonia::core::codecs::{Decoder, DecoderOptions};
use symphonia::core::conv::FromSample;
use symphonia::core::formats::{FormatOptions, FormatReader, SeekMode, SeekTo};
use symphonia::core::io::MediaSourceStream;
use symphonia::core::meta::MetadataOptions;
use symphonia::core::probe::Hint;
use symphonia::core::units::Time;

pub enum AudioCommand {
    PlayTrack { path: String, bit_perfect: bool, device_name: Option<String> },
    EnqueueTrack { path: String },
    Play,
    Pause,
    Stop,
    Seek(f64),
    SetVolume(f32),
    SetOutputDevice { device_name: Option<String>, bit_perfect: bool },
}

pub struct AudioEngineHandle {
    sender: Sender<AudioCommand>,
    telemetry: Arc<Mutex<AudioTelemetry>>,
}

impl AudioEngineHandle {
    pub fn new() -> Self {
        let (sender, receiver) = channel();
        let telemetry = Arc::new(Mutex::new(AudioTelemetry::default()));
        let telemetry_clone = Arc::clone(&telemetry);

        thread::Builder::new()
            .name("musicx-audio-core".to_string())
            .spawn(move || {
                let mut engine = AudioEngineInternal::new(receiver, telemetry_clone);
                engine.run();
            })
            .expect("Failed to spawn audio core thread");

        Self { sender, telemetry }
    }

    pub fn send(&self, cmd: AudioCommand) {
        let _ = self.sender.send(cmd);
    }

    pub fn get_telemetry(&self) -> AudioTelemetry {
        self.telemetry.lock().unwrap().clone()
    }
}

#[allow(dead_code)]
struct AudioSource {
    reader: Box<dyn FormatReader>,
    decoder: Box<dyn Decoder>,
    track_id: u32,
    sample_rate: u32,
    bit_depth: u16,
    channels: u16,
    duration_secs: f64,
    pub file_path: String,
    title: String,
    artist: String,
    album: String,
    file_size: u64,
}

impl AudioSource {
    fn open(path_str: &str) -> Result<Self, String> {
        let path = Path::new(path_str);
        let file = File::open(path).map_err(|e| e.to_string())?;
        let meta = file.metadata().map_err(|e| e.to_string())?;
        let file_size = meta.len();

        let ext = path.extension().and_then(|s| s.to_str()).unwrap_or("").to_lowercase();
        let mut hint = Hint::new();
        hint.with_extension(&ext);

        let mss = MediaSourceStream::new(Box::new(file), Default::default());
        let format_opts = FormatOptions {
            enable_gapless: true,
            ..Default::default()
        };
        let metadata_opts = MetadataOptions::default();

        let probed = symphonia::default::get_probe()
            .format(&hint, mss, &format_opts, &metadata_opts)
            .map_err(|e| e.to_string())?;

        let reader = probed.format;
        let track = reader.default_track().ok_or_else(|| "No audio track found".to_string())?;
        let track_id = track.id;
        let params = track.codec_params.clone();

        let sample_rate = params.sample_rate.unwrap_or(44_100);
        let bit_depth = params.bits_per_sample.unwrap_or(16) as u16;
        let channels = params.channels.map(|c| c.count() as u16).unwrap_or(2);

        let duration_secs = if let (Some(n_frames), Some(time_base)) = (params.n_frames, params.time_base) {
            let t = time_base.calc_time(n_frames);
            t.seconds as f64 + t.frac
        } else {
            0.0
        };

        let decoder_opts = DecoderOptions {
            verify: false,
        };
        let decoder = symphonia::default::get_codecs()
            .make(&params, &decoder_opts)
            .map_err(|e| e.to_string())?;

        let title = path.file_stem().and_then(|s| s.to_str()).unwrap_or("Pista").to_string();

        Ok(Self {
            reader,
            decoder,
            track_id,
            sample_rate,
            bit_depth,
            channels,
            duration_secs,
            file_path: path_str.to_string(),
            title,
            artist: "Desconocido".to_string(),
            album: "Desconocido".to_string(),
            file_size,
        })
    }
}

struct AudioEngineInternal {
    receiver: Receiver<AudioCommand>,
    telemetry: Arc<Mutex<AudioTelemetry>>,
    current_source: Option<AudioSource>,
    queue: VecDeque<String>,
    pcm_buffer: Arc<Mutex<VecDeque<f32>>>,
    cpal_stream: Option<Stream>,
    output_device_name: Option<String>,
    bit_perfect: bool,
    volume: Arc<Mutex<f32>>,
    is_playing: Arc<AtomicBool>,
    active_sample_rate: u32,
    active_channels: u16,
    samples_rendered: Arc<AtomicU32>,
    current_pos_secs: f64,
}

impl AudioEngineInternal {
    fn new(receiver: Receiver<AudioCommand>, telemetry: Arc<Mutex<AudioTelemetry>>) -> Self {
        Self {
            receiver,
            telemetry,
            current_source: None,
            queue: VecDeque::new(),
            pcm_buffer: Arc::new(Mutex::new(VecDeque::with_capacity(96_000 * 2))),
            cpal_stream: None,
            output_device_name: None,
            bit_perfect: true,
            volume: Arc::new(Mutex::new(1.0)),
            is_playing: Arc::new(AtomicBool::new(false)),
            active_sample_rate: 44_100,
            active_channels: 2,
            samples_rendered: Arc::new(AtomicU32::new(0)),
            current_pos_secs: 0.0,
        }
    }

    fn run(&mut self) {
        loop {
            // Process commands non-blocking
            while let Ok(cmd) = self.receiver.try_recv() {
                self.handle_command(cmd);
            }

            let playing = self.is_playing.load(Ordering::Relaxed);

            if playing {
                // Keep PCM buffer filled (aim for at least 1-2 seconds of decoded audio)
                let buffer_len = self.pcm_buffer.lock().unwrap().len();
                let target_capacity = (self.active_sample_rate as usize * self.active_channels as usize) * 2;

                if buffer_len < target_capacity {
                    self.decode_next_packet();
                }

                // Update playhead telemetry
                let rendered = self.samples_rendered.swap(0, Ordering::Relaxed);
                if rendered > 0 && self.active_sample_rate > 0 && self.active_channels > 0 {
                    let delta_sec = (rendered as f64) / (self.active_sample_rate as f64 * self.active_channels as f64);
                    self.current_pos_secs += delta_sec;
                }
            }

            self.update_telemetry();
            thread::sleep(Duration::from_millis(15));
        }
    }

    fn handle_command(&mut self, cmd: AudioCommand) {
        match cmd {
            AudioCommand::PlayTrack { path, bit_perfect, device_name } => {
                self.bit_perfect = bit_perfect;
                self.output_device_name = device_name;
                self.start_track(&path);
            }
            AudioCommand::EnqueueTrack { path } => {
                self.queue.push_back(path);
            }
            AudioCommand::Play => {
                self.is_playing.store(true, Ordering::Relaxed);
            }
            AudioCommand::Pause => {
                self.is_playing.store(false, Ordering::Relaxed);
            }
            AudioCommand::Stop => {
                self.is_playing.store(false, Ordering::Relaxed);
                self.pcm_buffer.lock().unwrap().clear();
                self.current_pos_secs = 0.0;
                self.current_source = None;
            }
            AudioCommand::Seek(target_secs) => {
                self.seek_to(target_secs);
            }
            AudioCommand::SetVolume(vol) => {
                let clamped = vol.clamp(0.0, 1.5);
                *self.volume.lock().unwrap() = clamped;
            }
            AudioCommand::SetOutputDevice { device_name, bit_perfect } => {
                self.output_device_name = device_name;
                self.bit_perfect = bit_perfect;
                // Re-initialize device stream if already playing
                if self.is_playing.load(Ordering::Relaxed) {
                    self.setup_cpal_stream();
                }
            }
        }
    }

    fn start_track(&mut self, path: &str) {
        match AudioSource::open(path) {
            Ok(source) => {
                let sr = source.sample_rate;
                let ch = source.channels;
                self.current_source = Some(source);
                self.current_pos_secs = 0.0;
                self.pcm_buffer.lock().unwrap().clear();

                // Reconfigure CPAL stream if sample rate or channel configuration changed
                if self.cpal_stream.is_none() || self.active_sample_rate != sr || self.active_channels != ch {
                    self.active_sample_rate = sr;
                    self.active_channels = ch;
                    self.setup_cpal_stream();
                }

                self.is_playing.store(true, Ordering::Relaxed);
            }
            Err(e) => {
                eprintln!("[musicx audio core] Error al abrir archivo {}: {}", path, e);
            }
        }
    }

    fn seek_to(&mut self, target_secs: f64) {
        if let Some(ref mut source) = self.current_source {
            let seek_time = Time::from(target_secs);
            if let Ok(_) = source.reader.seek(
                SeekMode::Coarse,
                SeekTo::Time {
                    time: seek_time,
                    track_id: Some(source.track_id),
                },
            ) {
                let _ = source.decoder.reset();
                self.pcm_buffer.lock().unwrap().clear();
                self.current_pos_secs = target_secs;
            }
        }
    }

    fn decode_next_packet(&mut self) {
        let (next_track, finished) = if let Some(ref mut source) = self.current_source {
            match source.reader.next_packet() {
                Ok(packet) => {
                    if packet.track_id() == source.track_id {
                        if let Ok(decoded) = source.decoder.decode(&packet) {
                            Self::convert_and_push(&decoded, &self.pcm_buffer);
                        }
                    }
                    (None, false)
                }
                Err(_) => {
                    // Current track reached EOF. Check gapless queue
                    (self.queue.pop_front(), true)
                }
            }
        } else {
            (self.queue.pop_front(), false)
        };

        if finished {
            if let Some(next_path) = next_track {
                // Gapless transition: instantly open next track into the stream
                let _ = self.start_track(&next_path);
            } else {
                // Wait for buffer to drain
                if self.pcm_buffer.lock().unwrap().is_empty() {
                    self.is_playing.store(false, Ordering::Relaxed);
                }
            }
        }
    }

    fn convert_and_push(decoded: &AudioBufferRef, buffer: &Arc<Mutex<VecDeque<f32>>>) {
        let mut target = buffer.lock().unwrap();

        match decoded {
            AudioBufferRef::F32(buf) => {
                let num_planes = buf.planes().planes().len();
                let num_frames = buf.frames();
                if num_planes == 1 {
                    for &s in buf.chan(0) {
                        target.push_back(s);
                    }
                } else if num_planes >= 2 {
                    let left = buf.chan(0);
                    let right = buf.chan(1);
                    for i in 0..num_frames {
                        target.push_back(left[i]);
                        target.push_back(right[i]);
                    }
                }
            }
            AudioBufferRef::S16(buf) => {
                let num_planes = buf.planes().planes().len();
                let num_frames = buf.frames();
                if num_planes == 1 {
                    for &s in buf.chan(0) {
                        target.push_back(f32::from_sample(s));
                    }
                } else if num_planes >= 2 {
                    let left = buf.chan(0);
                    let right = buf.chan(1);
                    for i in 0..num_frames {
                        target.push_back(f32::from_sample(left[i]));
                        target.push_back(f32::from_sample(right[i]));
                    }
                }
            }
            AudioBufferRef::S24(buf) => {
                let num_planes = buf.planes().planes().len();
                let num_frames = buf.frames();
                if num_planes == 1 {
                    for &s in buf.chan(0) {
                        target.push_back(f32::from_sample(s));
                    }
                } else if num_planes >= 2 {
                    let left = buf.chan(0);
                    let right = buf.chan(1);
                    for i in 0..num_frames {
                        target.push_back(f32::from_sample(left[i]));
                        target.push_back(f32::from_sample(right[i]));
                    }
                }
            }
            AudioBufferRef::S32(buf) => {
                let num_planes = buf.planes().planes().len();
                let num_frames = buf.frames();
                if num_planes == 1 {
                    for &s in buf.chan(0) {
                        target.push_back(f32::from_sample(s));
                    }
                } else if num_planes >= 2 {
                    let left = buf.chan(0);
                    let right = buf.chan(1);
                    for i in 0..num_frames {
                        target.push_back(f32::from_sample(left[i]));
                        target.push_back(f32::from_sample(right[i]));
                    }
                }
            }
            AudioBufferRef::U8(buf) => {
                for &s in buf.chan(0) {
                    target.push_back(f32::from_sample(s));
                }
            }
            _ => {}
        }
    }

    fn setup_cpal_stream(&mut self) {
        let host = cpal::default_host();

        let device = if let Some(ref dev_name) = self.output_device_name {
            host.output_devices()
                .ok()
                .and_then(|mut devs| devs.find(|d| d.name().map(|n| n == *dev_name).unwrap_or(false)))
                .or_else(|| host.default_output_device())
        } else {
            host.default_output_device()
        };

        let device = match device {
            Some(d) => d,
            None => {
                eprintln!("[musicx audio core] No audio output device available");
                return;
            }
        };

        let config = StreamConfig {
            channels: self.active_channels,
            sample_rate: cpal::SampleRate(self.active_sample_rate),
            buffer_size: cpal::BufferSize::Default,
        };

        let pcm_buffer_clone = Arc::clone(&self.pcm_buffer);
        let volume_clone = Arc::clone(&self.volume);
        let is_playing_clone = Arc::clone(&self.is_playing);
        let samples_counter = Arc::clone(&self.samples_rendered);

        let err_fn = |err| eprintln!("[musicx cpal stream error]: {}", err);

        let stream_result = device.build_output_stream(
            &config,
            move |data: &mut [f32], _: &cpal::OutputCallbackInfo| {
                let playing = is_playing_clone.load(Ordering::Relaxed);
                let vol = *volume_clone.lock().unwrap();

                if !playing {
                    for sample in data.iter_mut() {
                        *sample = 0.0;
                    }
                    return;
                }

                let mut buf = pcm_buffer_clone.lock().unwrap();
                let mut rendered = 0;

                for sample in data.iter_mut() {
                    if let Some(val) = buf.pop_front() {
                        *sample = val * vol;
                        rendered += 1;
                    } else {
                        *sample = 0.0;
                    }
                }

                samples_counter.fetch_add(rendered, Ordering::Relaxed);
            },
            err_fn,
            None,
        );

        match stream_result {
            Ok(stream) => {
                let _ = stream.play();
                self.cpal_stream = Some(stream);
            }
            Err(e) => {
                eprintln!("[musicx audio core] Fallo al crear stream CPAL: {}", e);
            }
        }
    }

    fn update_telemetry(&self) {
        let is_playing = self.is_playing.load(Ordering::Relaxed);
        let mut tele = self.telemetry.lock().unwrap();

        tele.state = if is_playing {
            PlaybackState::Playing
        } else if self.current_source.is_some() && self.current_pos_secs > 0.0 {
            PlaybackState::Paused
        } else {
            PlaybackState::Stopped
        };

        tele.current_position_secs = self.current_pos_secs;
        tele.volume = *self.volume.lock().unwrap();
        tele.bit_perfect = self.bit_perfect;
        tele.output_device = self
            .output_device_name
            .clone()
            .unwrap_or_else(|| "System Default (PipeWire/ALSA)".to_string());

        if let Some(ref src) = self.current_source {
            tele.sample_rate = src.sample_rate;
            tele.bit_depth = src.bit_depth;
            tele.channels = src.channels;
            tele.duration_secs = src.duration_secs;
            tele.bitrate_kbps = if src.duration_secs > 0.0 {
                ((src.file_size as f64 * 8.0) / (src.duration_secs * 1000.0)).round() as u32
            } else {
                0
            };
            tele.track_title = Some(src.title.clone());
            tele.track_artist = Some(src.artist.clone());
            tele.track_album = Some(src.album.clone());
            tele.filepath = Some(src.file_path.clone());
        }
    }
}

/// Helper para listar los dispositivos de salida disponibles
pub fn get_available_audio_devices() -> Vec<String> {
    let host = cpal::default_host();
    let mut names = Vec::new();

    if let Ok(devices) = host.output_devices() {
        for dev in devices {
            if let Ok(name) = dev.name() {
                names.push(name);
            }
        }
    }

    names
}
