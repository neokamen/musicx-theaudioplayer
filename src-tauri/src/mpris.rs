use crate::audio::{AudioCommand, AudioEngineHandle};
use crate::models::PlaybackState;
use mpris_player::{Metadata, MprisPlayer, PlaybackStatus};
use std::sync::Arc;
use std::thread;
use std::time::Duration;

pub fn start_mpris_service(audio_engine: Arc<AudioEngineHandle>) {
    thread::Builder::new()
        .name("musicx-mpris".to_string())
        .spawn(move || {
            let mpris = MprisPlayer::new(
                "musicx".to_string(),
                "musicx - the audio player".to_string(),
                "musicx".to_string(),
            );

            // Register handlers for MPRIS signals
            let engine_play = Arc::clone(&audio_engine);
            let engine_pause = Arc::clone(&audio_engine);
            let engine_stop = Arc::clone(&audio_engine);
            let engine_play_pause = Arc::clone(&audio_engine);
            let engine_seek = Arc::clone(&audio_engine);

            mpris.connect_play(move || {
                engine_play.send(AudioCommand::Play);
            });

            mpris.connect_pause(move || {
                engine_pause.send(AudioCommand::Pause);
            });

            mpris.connect_stop(move || {
                engine_stop.send(AudioCommand::Stop);
            });

            mpris.connect_play_pause(move || {
                let tele = engine_play_pause.get_telemetry();
                match tele.state {
                    PlaybackState::Playing => engine_play_pause.send(AudioCommand::Pause),
                    _ => engine_play_pause.send(AudioCommand::Play),
                }
            });

            mpris.connect_seek(move |offset_micros: i64| {
                let tele = engine_seek.get_telemetry();
                let current = tele.current_position_secs;
                let offset_secs = (offset_micros as f64) / 1_000_000.0;
                let new_pos = (current + offset_secs).max(0.0);
                engine_seek.send(AudioCommand::Seek(new_pos));
            });

            // Keep status and metadata synchronized with audio engine
            let mut last_title = None;
            let mut last_state = PlaybackState::Stopped;

            loop {
                let tele = audio_engine.get_telemetry();

                if tele.state != last_state {
                    last_state = tele.state;
                    let mpris_status = match tele.state {
                        PlaybackState::Playing => PlaybackStatus::Playing,
                        PlaybackState::Paused => PlaybackStatus::Paused,
                        PlaybackState::Stopped => PlaybackStatus::Stopped,
                    };
                    mpris.set_playback_status(mpris_status);
                }

                if tele.track_title != last_title {
                    last_title = tele.track_title.clone();
                    let mut meta = Metadata::new();
                    meta.title = tele.track_title.clone();
                    meta.artist = tele.track_artist.clone().map(|a| vec![a]);
                    meta.album = tele.track_album.clone();
                    if tele.duration_secs > 0.0 {
                        meta.length = Some((tele.duration_secs * 1_000_000.0) as i64);
                    }
                    mpris.set_metadata(meta);
                }

                thread::sleep(Duration::from_millis(150));
            }
        })
        .expect("Failed to start MPRIS thread");
}
