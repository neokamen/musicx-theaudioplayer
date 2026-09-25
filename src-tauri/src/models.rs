use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrackMetadata {
    pub id: Option<i64>,
    pub filepath: String,
    pub title: String,
    pub artist: String,
    pub album: String,
    pub track_number: Option<u32>,
    pub duration_seconds: f64,
    pub format: String,
    pub sample_rate: u32,
    pub bit_depth: u16,
    pub bitrate_kbps: u32,
    pub file_size: u64,
    pub mtime: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub extension: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum PlaybackState {
    Playing,
    Paused,
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioTelemetry {
    pub state: PlaybackState,
    pub current_position_secs: f64,
    pub duration_secs: f64,
    pub sample_rate: u32,
    pub bit_depth: u16,
    pub channels: u16,
    pub bitrate_kbps: u32,
    pub volume: f32,
    pub bit_perfect: bool,
    pub output_device: String,
    pub track_title: Option<String>,
    pub track_artist: Option<String>,
    pub track_album: Option<String>,
    pub filepath: Option<String>,
    pub spectrum: Vec<f32>,
}

impl Default for AudioTelemetry {
    fn default() -> Self {
        Self {
            state: PlaybackState::Stopped,
            current_position_secs: 0.0,
            duration_secs: 0.0,
            sample_rate: 44100,
            bit_depth: 16,
            channels: 2,
            bitrate_kbps: 1411,
            volume: 1.0,
            bit_perfect: true,
            output_device: "ALSA (Bit-Perfect Direct)".to_string(),
            track_title: None,
            track_artist: None,
            track_album: None,
            filepath: None,
            spectrum: vec![0.0; 16],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanProgress {
    pub scanned_files: usize,
    pub total_files: usize,
    pub current_path: String,
    pub is_finished: bool,
}
