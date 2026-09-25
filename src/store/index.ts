import { create } from "zustand";
import type { AudioTelemetry, FileNode, PlaybackState, RepeatMode, ScanStatus, Track } from "../types/index.ts";
import * as api from "../services/api.ts";

export interface ExplorerState {
  currentPath: string;
  entries: FileNode[];
  isLoading: boolean;
  error: string | null;
  history: string[];
  historyIndex: number;
}

export interface MusicPlayerStore {
  isPlaying: boolean;
  volume: number;
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  shuffle: boolean;
  repeat: RepeatMode;

  telemetry: AudioTelemetry;
  availableDevices: string[];
  selectedDevice: string;
  bitPerfectMode: boolean;

  libraryTracks: Track[];
  scanStatus: ScanStatus;
  librarySearchQuery: string;

  explorer: ExplorerState;

  play: (track?: Track) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  setVolume: (vol: number) => Promise<void>;
  nextTrack: () => Promise<void>;
  previousTrack: () => Promise<void>;
  setQueue: (tracks: Track[], startIndex?: number) => Promise<void>;
  addToQueue: (track: Track | Track[]) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;

  setBitPerfectMode: (enabled: boolean) => Promise<void>;
  setOutputDevice: (deviceName: string) => Promise<void>;
  refreshAudioDevices: () => Promise<void>;

  fetchLibraryTracks: (query?: string) => Promise<void>;
  startDirectoryScan: (path: string, force?: boolean) => Promise<void>;

  browseDirectory: (path: string) => Promise<void>;
  navigateBack: () => Promise<void>;
  navigateForward: () => Promise<void>;
  navigateUp: () => Promise<void>;

  updateTelemetry: (telemetry: AudioTelemetry) => void;
  updateScanStatus: (status: ScanStatus) => void;
  handleTrackEnded: (filepath: string) => Promise<void>;
  initListeners: () => Promise<() => void>;
}

const initialTelemetry: AudioTelemetry = {
  state: "Stopped" as PlaybackState,
  current_time: 0,
  duration: 0,
  sample_rate: 0,
  bits_per_sample: 0,
  bitrate: 0,
  channels: 2,
  volume: 1.0,
  is_bit_perfect: false,
  output_device: "Default",
  track_title: null,
  track_artist: null,
  track_album: null,
  filepath: null,
};

const defaultHomePath = "/home";

export const useMusicStore = create<MusicPlayerStore>((set, get) => ({
  isPlaying: false,
  volume: 1.0,
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  shuffle: false,
  repeat: "off",

  telemetry: initialTelemetry,
  availableDevices: [],
  selectedDevice: "Default",
  bitPerfectMode: false,

  libraryTracks: [],
  scanStatus: {
    is_scanning: false,
    current: 0,
    total: 0,
  },
  librarySearchQuery: "",

  explorer: {
    currentPath: defaultHomePath,
    entries: [],
    isLoading: false,
    error: null,
    history: [defaultHomePath],
    historyIndex: 0,
  },

  play: async (track?: Track) => {
    const targetTrack = track ?? get().currentTrack;
    if (!targetTrack) return;

    const { bitPerfectMode, selectedDevice } = get();

    await api.playTrack(
      targetTrack.filepath,
      bitPerfectMode,
      selectedDevice === "Default" ? undefined : selectedDevice
    );

    set((state) => {
      let newQueue = state.queue;
      let newIndex = state.queueIndex;

      const foundIdx = newQueue.findIndex((t) => t.filepath === targetTrack.filepath);
      if (foundIdx === -1) {
        newQueue = [...newQueue, targetTrack];
        newIndex = newQueue.length - 1;
      } else {
        newIndex = foundIdx;
      }

      return {
        currentTrack: targetTrack,
        isPlaying: true,
        queue: newQueue,
        queueIndex: newIndex,
      };
    });
  },

  pause: async () => {
    await api.pause();
    set({ isPlaying: false });
  },

  resume: async () => {
    await api.resume();
    set({ isPlaying: true });
  },

  stop: async () => {
    await api.stop();
    set({ isPlaying: false, telemetry: { ...get().telemetry, current_time: 0 } });
  },

  togglePlayPause: async () => {
    const { isPlaying, currentTrack, resume, pause, play, queue } = get();
    if (isPlaying) {
      await pause();
    } else if (currentTrack) {
      await resume();
    } else if (queue.length > 0) {
      await play(queue[0]);
    }
  },

  seek: async (seconds: number) => {
    await api.seek(seconds);
  },

  setVolume: async (vol: number) => {
    const clamped = Math.max(0, Math.min(1.5, vol));
    await api.setVolume(clamped);
    set({ volume: clamped });
  },

  nextTrack: async () => {
    const { queue, queueIndex, shuffle, repeat, play } = get();
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;

    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      if (repeat === "all") {
        nextIdx = 0;
      } else {
        return;
      }
    }

    const nextTrack = queue[nextIdx];
    if (nextTrack) {
      set({ queueIndex: nextIdx, currentTrack: nextTrack });
      await play(nextTrack);
    }
  },

  previousTrack: async () => {
    const { queue, queueIndex, telemetry, seek, play } = get();
    if (queue.length === 0) return;

    if (telemetry.current_time > 3) {
      await seek(0);
      return;
    }

    const prevIdx = Math.max(0, queueIndex - 1);
    const prevTrack = queue[prevIdx];
    if (prevTrack) {
      set({ queueIndex: prevIdx, currentTrack: prevTrack });
      await play(prevTrack);
    }
  },

  setQueue: async (tracks: Track[], startIndex: number = 0) => {
    set({
      queue: tracks,
      queueIndex: startIndex,
      currentTrack: tracks[startIndex] || null,
    });
    if (tracks[startIndex]) {
      await get().play(tracks[startIndex]);
    }
  },

  addToQueue: (items: Track | Track[]) => {
    const toAdd = Array.isArray(items) ? items : [items];
    set((state) => ({
      queue: [...state.queue, ...toAdd],
    }));
  },

  removeFromQueue: (index: number) => {
    set((state) => {
      const newQueue = [...state.queue];
      newQueue.splice(index, 1);
      let newIdx = state.queueIndex;
      if (index < state.queueIndex) {
        newIdx = Math.max(0, state.queueIndex - 1);
      }
      return {
        queue: newQueue,
        queueIndex: newIdx,
      };
    });
  },

  clearQueue: () => {
    set({
      queue: [],
      queueIndex: -1,
      currentTrack: null,
      isPlaying: false,
    });
    api.stop();
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  cycleRepeat: () => {
    set((state) => {
      const modes: RepeatMode[] = ["off", "all", "one"];
      const currentIdx = modes.indexOf(state.repeat);
      const nextMode = modes[(currentIdx + 1) % modes.length];
      return { repeat: nextMode };
    });
  },

  setBitPerfectMode: async (enabled: boolean) => {
    set({ bitPerfectMode: enabled });
    const { selectedDevice } = get();
    await api.setOutputDevice(
      selectedDevice === "Default" ? undefined : selectedDevice,
      enabled
    );
  },

  setOutputDevice: async (deviceName: string) => {
    set({ selectedDevice: deviceName });
    const { bitPerfectMode } = get();
    await api.setOutputDevice(
      deviceName === "Default" ? undefined : deviceName,
      bitPerfectMode
    );
  },

  refreshAudioDevices: async () => {
    try {
      const devices = await api.listAudioDevices();
      set({ availableDevices: ["Default", ...devices] });
    } catch (e) {
      console.error("Error al listar dispositivos de audio:", e);
    }
  },

  fetchLibraryTracks: async (query?: string) => {
    try {
      const tracks = await api.getTracksFromDb(query);
      set({ libraryTracks: tracks, librarySearchQuery: query || "" });
    } catch (e) {
      console.error("Error al obtener pistas de la base de datos:", e);
    }
  },

  startDirectoryScan: async (path: string, force: boolean = false) => {
    set({
      scanStatus: {
        is_scanning: true,
        current: 0,
        total: 0,
        current_path: path,
      },
    });
    try {
      await api.triggerScan(path, force);
    } catch (e) {
      console.error("Error al disparar escaneo:", e);
      set((state) => ({
        scanStatus: { ...state.scanStatus, is_scanning: false },
      }));
    }
  },

  browseDirectory: async (path: string) => {
    set((state) => ({
      explorer: { ...state.explorer, isLoading: true, error: null },
    }));

    try {
      const entries = await api.readDirectoryLazy(path);
      set((state) => {
        const nextHistory = state.explorer.history.slice(0, state.explorer.historyIndex + 1);
        nextHistory.push(path);

        return {
          explorer: {
            currentPath: path,
            entries,
            isLoading: false,
            error: null,
            history: nextHistory,
            historyIndex: nextHistory.length - 1,
          },
        };
      });
    } catch (err) {
      set((state) => ({
        explorer: {
          ...state.explorer,
          isLoading: false,
          error: String(err),
        },
      }));
    }
  },

  navigateBack: async () => {
    const { explorer, browseDirectory } = get();
    if (explorer.historyIndex > 0) {
      const targetPath = explorer.history[explorer.historyIndex - 1];
      set((state) => ({
        explorer: {
          ...state.explorer,
          historyIndex: state.explorer.historyIndex - 1,
        },
      }));
      await browseDirectory(targetPath);
    }
  },

  navigateForward: async () => {
    const { explorer, browseDirectory } = get();
    if (explorer.historyIndex < explorer.history.length - 1) {
      const targetPath = explorer.history[explorer.historyIndex + 1];
      set((state) => ({
        explorer: {
          ...state.explorer,
          historyIndex: state.explorer.historyIndex + 1,
        },
      }));
      await browseDirectory(targetPath);
    }
  },

  navigateUp: async () => {
    const { explorer, browseDirectory } = get();
    const parts = explorer.currentPath.split("/").filter(Boolean);
    if (parts.length > 0) {
      parts.pop();
      const parentPath = "/" + parts.join("/");
      await browseDirectory(parentPath || "/");
    }
  },

  updateTelemetry: (telemetry: AudioTelemetry) => {
    set((state) => ({
      telemetry,
      isPlaying: telemetry.state === "Playing",
      volume: telemetry.volume,
      bitPerfectMode: telemetry.is_bit_perfect,
      selectedDevice: telemetry.output_device,
      currentTrack:
        state.currentTrack && state.currentTrack.filepath === telemetry.filepath
          ? {
              ...state.currentTrack,
              sample_rate: telemetry.sample_rate || state.currentTrack.sample_rate,
              bit_depth: telemetry.bits_per_sample || state.currentTrack.bit_depth,
              bitrate_kbps: telemetry.bitrate || state.currentTrack.bitrate_kbps,
            }
          : state.currentTrack,
    }));
  },

  updateScanStatus: (status: ScanStatus) => {
    set({ scanStatus: status });
    if (!status.is_scanning) {
      get().fetchLibraryTracks(get().librarySearchQuery);
    }
  },

  handleTrackEnded: async (_filepath: string) => {
    const { repeat, currentTrack, play, nextTrack } = get();
    if (repeat === "one" && currentTrack) {
      await play(currentTrack);
    } else {
      await nextTrack();
    }
  },

  initListeners: async () => {
    const unlistenTele = await api.onAudioTelemetry((tele: AudioTelemetry) => {
      get().updateTelemetry(tele);
    });

    const unlistenScan = await api.onScanProgress((status: ScanStatus) => {
      get().updateScanStatus(status);
    });

    const unlistenEnded = await api.onTrackEnded((filepath: string) => {
      get().handleTrackEnded(filepath);
    });

    await get().refreshAudioDevices();
    await get().fetchLibraryTracks();
    await get().browseDirectory(get().explorer.currentPath);

    return () => {
      unlistenTele();
      unlistenScan();
      unlistenEnded();
    };
  },
}));
