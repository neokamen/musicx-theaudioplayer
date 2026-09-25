import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type {
  AudioTelemetry,
  BackendScanProgressPayload,
  BackendTelemetryPayload,
  FileNode,
  ScanStatus,
  Track,
} from "../types/index.ts";

export function normalizeTelemetry(payload: BackendTelemetryPayload): AudioTelemetry {
  return {
    state: payload.state,
    current_time: payload.current_position_secs,
    duration: payload.duration_secs,
    sample_rate: payload.sample_rate,
    bits_per_sample: payload.bit_depth,
    bitrate: payload.bitrate_kbps,
    channels: payload.channels,
    volume: payload.volume,
    is_bit_perfect: payload.bit_perfect,
    output_device: payload.output_device,
    track_title: payload.track_title,
    track_artist: payload.track_artist,
    track_album: payload.track_album,
    filepath: payload.filepath,
  };
}

export function normalizeScanProgress(payload: BackendScanProgressPayload): ScanStatus {
  return {
    is_scanning: !payload.is_finished,
    current: payload.scanned_files,
    total: payload.total_files,
    current_path: payload.current_path,
  };
}

export async function playTrack(
  path: string,
  bitPerfect: boolean = false,
  deviceName?: string
): Promise<void> {
  return invoke<void>("play_track", {
    path,
    bitPerfect,
    deviceName,
  });
}

export async function pause(): Promise<void> {
  return invoke<void>("pause_track");
}

export async function resume(): Promise<void> {
  return invoke<void>("resume_track");
}

export async function stop(): Promise<void> {
  return invoke<void>("stop_track");
}

export async function seek(seconds: number): Promise<void> {
  return invoke<void>("seek_track", { positionSeconds: seconds });
}

export async function setVolume(vol: number): Promise<void> {
  return invoke<void>("set_volume", { volume: vol });
}

export async function setOutputDevice(
  deviceName?: string,
  bitPerfect: boolean = false
): Promise<void> {
  return invoke<void>("set_output_device", {
    deviceName,
    bitPerfect,
  });
}

export async function listAudioDevices(): Promise<string[]> {
  return invoke<string[]>("list_audio_devices");
}

export async function readDirectoryLazy(path: string): Promise<FileNode[]> {
  return invoke<FileNode[]>("read_directory_lazy", { path });
}

export async function triggerScan(path: string, _force: boolean = false): Promise<void> {
  return invoke<void>("scan_directory", { path });
}

export async function getTracksFromDb(query?: string): Promise<Track[]> {
  return invoke<Track[]>("get_library_tracks", {
    query: query && query.trim().length > 0 ? query.trim() : null,
  });
}

export async function getAudioEngineStatus(): Promise<{
  engine: string;
  status: string;
  sample_rate: number;
  bit_depth: number;
  channels: number;
  driver: string;
  supported_codecs: string[];
}> {
  return invoke("get_audio_engine_status");
}

export async function onAudioTelemetry(
  callback: (telemetry: AudioTelemetry) => void
): Promise<UnlistenFn> {
  return listen<BackendTelemetryPayload>("audio-telemetry", (event) => {
    callback(normalizeTelemetry(event.payload));
  });
}

export async function onScanProgress(
  callback: (status: ScanStatus) => void
): Promise<UnlistenFn> {
  return listen<BackendScanProgressPayload>("scan-progress", (event) => {
    callback(normalizeScanProgress(event.payload));
  });
}

export async function getTrackCoverArt(filepath: string): Promise<string | null> {
  return invoke<string | null>("get_track_cover_art", { path: filepath });
}

export async function onTrackEnded(
  callback: (filepath: string) => void
): Promise<UnlistenFn> {
  return listen<string>("track-ended", (event) => {
    callback(event.payload);
  });
}
