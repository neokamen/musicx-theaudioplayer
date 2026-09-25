/**
 * Definiciones de Tipos TypeScript estrictas para "musicx - the audio player"
 */

export interface Track {
  id?: number;
  filepath: string;
  title: string;
  artist: string;
  album: string;
  track_number: number | null;
  duration_seconds: number;
  format: string;
  sample_rate: number;
  bit_depth: number;
  bitrate_kbps: number;
  file_size: number;
  mtime: number;
}

export interface FileNode {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  extension?: string | null;
}

export type PlaybackState = "Playing" | "Paused" | "Stopped";

export interface AudioTelemetry {
  state: PlaybackState;
  current_time: number;
  duration: number;
  sample_rate: number;
  bits_per_sample: number;
  bitrate: number;
  channels: number;
  volume: number;
  is_bit_perfect: boolean;
  output_device: string;
  track_title: string | null;
  track_artist: string | null;
  track_album: string | null;
  filepath: string | null;
  spectrum: number[];
}

export interface BackendTelemetryPayload {
  state: PlaybackState;
  current_position_secs: number;
  duration_secs: number;
  sample_rate: number;
  bit_depth: number;
  channels: number;
  bitrate_kbps: number;
  volume: number;
  bit_perfect: boolean;
  output_device: string;
  track_title: string | null;
  track_artist: string | null;
  track_album: string | null;
  filepath: string | null;
  spectrum?: number[];
}

export interface ScanStatus {
  is_scanning: boolean;
  current: number;
  total: number;
  current_path?: string;
}

export interface BackendScanProgressPayload {
  scanned_files: number;
  total_files: number;
  current_path: string;
  is_finished: boolean;
}

export type RepeatMode = "off" | "all" | "one";

export interface PlayerState {
  is_playing: boolean;
  volume: number;
  current_track: Track | null;
  queue: Track[];
  queue_index: number;
  shuffle: boolean;
  repeat: RepeatMode;
}
