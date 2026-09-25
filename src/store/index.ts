import { create } from "zustand";
import type { AudioTelemetry, FileNode, PlaybackState, RepeatMode, ScanStatus, Track } from "../types/index.ts";
import * as api from "../services/api.ts";
import type { Language } from "../i18n/translations.ts";
import type { SpectrumStyle } from "../components/widgets/SpectrumVisualizer.tsx";

export interface ExplorerState {
  currentPath: string;
  entries: FileNode[];
  isLoading: boolean;
  error: string | null;
  history: string[];
  historyIndex: number;
}

export interface AppearanceState {
  accentColor: string;
  accentPreset: string;
  bgColor: string;
  bgPreset: string;
  glassmorphism: boolean;
  glassBlur: number;
  neonGlow: boolean;
  neonIntensity: number;
  borderEffect: boolean;
  borderOpacity: number;
  borderRadius: number;
  borderGlow: boolean;
  spectrumFps: 30 | 60 | 120;
  spectrumStyle: SpectrumStyle;
}

export interface LibrarySettings {
  musicFolder: string;
  autoScanOnStartup: boolean;
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

  // Settings & Customizations
  language: Language;
  appearance: AppearanceState;
  librarySettings: LibrarySettings;
  isSettingsOpen: boolean;
  currentCoverArt: string | null;
  coverArtCache: Record<string, string>;

  // Actions
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

  // Settings actions
  setLanguage: (lang: Language) => void;
  setAppearance: (appearance: Partial<AppearanceState>) => void;
  setLibrarySettings: (settings: Partial<LibrarySettings>) => void;
  setSettingsOpen: (open: boolean) => void;
  fetchTrackCoverArt: (filepath: string) => Promise<string | null>;
  saveWindowSize: () => Promise<void>;

  updateTelemetry: (telemetry: AudioTelemetry) => void;
  updateScanStatus: (status: ScanStatus) => void;
  handleTrackEnded: (filepath: string) => Promise<void>;
  initListeners: () => Promise<() => void>;
}

const SETTINGS_STORAGE_KEY = "musicx_settings_v1";

const defaultAppearance: AppearanceState = {
  accentColor: "#06b6d4", // Cyan
  accentPreset: "cyan",
  bgColor: "#090d16",
  bgPreset: "obsidian",
  glassmorphism: true,
  glassBlur: 10,
  neonGlow: true,
  neonIntensity: 50,
  borderEffect: true,
  borderOpacity: 40,
  borderRadius: 8,
  borderGlow: true,
  spectrumFps: 60,
  spectrumStyle: "bars",
};

const defaultLibrarySettings: LibrarySettings = {
  musicFolder: "/home",
  autoScanOnStartup: true,
};

function loadStoredSettings(): {
  language: Language;
  appearance: AppearanceState;
  librarySettings: LibrarySettings;
} {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        language: parsed.language || "es",
        appearance: { ...defaultAppearance, ...(parsed.appearance || {}) },
        librarySettings: { ...defaultLibrarySettings, ...(parsed.librarySettings || {}) },
      };
    }
  } catch {
    // Fallback on parse failure
  }
  return {
    language: "es",
    appearance: defaultAppearance,
    librarySettings: defaultLibrarySettings,
  };
}

function saveStoredSettings(state: {
  language: Language;
  appearance: AppearanceState;
  librarySettings: LibrarySettings;
}) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore write failure
  }
}

const stored = loadStoredSettings();

const initialTelemetry: AudioTelemetry = {
  state: "Stopped" as PlaybackState,
  current_time: 0,
  duration: 0,
  sample_rate: 44100,
  bits_per_sample: 16,
  bitrate: 1411,
  channels: 2,
  volume: 1.0,
  is_bit_perfect: true, // Bit-perfect exclusive mode on by default
  output_device: "ALSA (Bit-Perfect Direct)",
  track_title: null,
  track_artist: null,
  track_album: null,
  filepath: null,
};

const defaultHomePath = stored.librarySettings.musicFolder || "/home";

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
  bitPerfectMode: true, // Bit-perfect exclusive by default

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

  language: stored.language,
  appearance: stored.appearance,
  librarySettings: stored.librarySettings,
  isSettingsOpen: false,
  currentCoverArt: null,
  coverArtCache: {},

  play: async (track?: Track) => {
    const targetTrack = track ?? get().currentTrack;
    if (!targetTrack) return;

    const { bitPerfectMode, selectedDevice, fetchTrackCoverArt } = get();

    await api.playTrack(
      targetTrack.filepath,
      bitPerfectMode,
      selectedDevice === "Default" ? undefined : selectedDevice
    );

    // Fetch cover art concurrently
    fetchTrackCoverArt(targetTrack.filepath);

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
    set({ isPlaying: false });
  },

  togglePlayPause: async () => {
    const { isPlaying, pause, resume, play } = get();
    if (isPlaying) {
      await pause();
    } else if (get().currentTrack) {
      await resume();
    } else if (get().queue.length > 0) {
      await play(get().queue[0]);
    }
  },

  seek: async (seconds: number) => {
    await api.seek(seconds);
  },

  setVolume: async (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    await api.setVolume(clamped);
    set({ volume: clamped });
  },

  nextTrack: async () => {
    const { queue, queueIndex, shuffle, play } = get();
    if (queue.length === 0) return;

    let nextIdx = queueIndex + 1;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else if (nextIdx >= queue.length) {
      nextIdx = 0;
    }

    await play(queue[nextIdx]);
  },

  previousTrack: async () => {
    const { queue, queueIndex, play } = get();
    if (queue.length === 0) return;

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) {
      prevIdx = queue.length - 1;
    }

    await play(queue[prevIdx]);
  },

  setQueue: async (tracks: Track[], startIndex = 0) => {
    set({ queue: tracks, queueIndex: startIndex });
    if (tracks[startIndex]) {
      await get().play(tracks[startIndex]);
    }
  },

  addToQueue: (track: Track | Track[]) => {
    const toAdd = Array.isArray(track) ? track : [track];
    set((state) => ({ queue: [...state.queue, ...toAdd] }));
  },

  removeFromQueue: (index: number) => {
    set((state) => {
      const newQueue = [...state.queue];
      newQueue.splice(index, 1);
      let newIdx = state.queueIndex;
      if (index < state.queueIndex) {
        newIdx--;
      } else if (index === state.queueIndex) {
        newIdx = Math.min(newIdx, newQueue.length - 1);
      }
      return { queue: newQueue, queueIndex: newIdx };
    });
  },

  clearQueue: () => {
    set({ queue: [], queueIndex: -1 });
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  cycleRepeat: () => {
    set((state) => {
      const modes: RepeatMode[] = ["off", "all", "one"];
      const nextIdx = (modes.indexOf(state.repeat) + 1) % modes.length;
      return { repeat: modes[nextIdx] };
    });
  },

  setBitPerfectMode: async (enabled: boolean) => {
    const { selectedDevice } = get();
    set({ bitPerfectMode: enabled });
    await api.setOutputDevice(
      selectedDevice === "Default" ? undefined : selectedDevice,
      enabled
    );
  },

  setOutputDevice: async (deviceName: string) => {
    const { bitPerfectMode } = get();
    set({ selectedDevice: deviceName });
    await api.setOutputDevice(
      deviceName === "Default" ? undefined : deviceName,
      bitPerfectMode
    );
  },

  refreshAudioDevices: async () => {
    try {
      const devices = await api.listAudioDevices();
      set({ availableDevices: ["Default", ...devices] });
    } catch {
      // Fallback
    }
  },

  fetchLibraryTracks: async (query?: string) => {
    try {
      const tracks = await api.getTracksFromDb(query);
      set({ libraryTracks: tracks, librarySearchQuery: query || "" });
    } catch {
      // Ignore
    }
  },

  startDirectoryScan: async (path: string, force = false) => {
    try {
      set({ scanStatus: { is_scanning: true, current: 0, total: 0, current_path: path } });
      await api.triggerScan(path, force);
    } catch (err: unknown) {
      set({ scanStatus: { is_scanning: false, current: 0, total: 0 } });
      console.error("Failed to start directory scan:", err);
    }
  },

  browseDirectory: async (path: string) => {
    set((state) => ({
      explorer: { ...state.explorer, isLoading: true, error: null },
    }));

    try {
      const entries = await api.readDirectoryLazy(path);
      set((state) => {
        const history = state.explorer.history.slice(0, state.explorer.historyIndex + 1);
        if (history[history.length - 1] !== path) {
          history.push(path);
        }
        return {
          explorer: {
            currentPath: path,
            entries,
            isLoading: false,
            error: null,
            history,
            historyIndex: history.length - 1,
          },
        };
      });
    } catch (err: unknown) {
      set((state) => ({
        explorer: {
          ...state.explorer,
          isLoading: false,
          error: err instanceof Error ? err.message : String(err),
        },
      }));
    }
  },

  navigateBack: async () => {
    const { explorer, browseDirectory } = get();
    if (explorer.historyIndex > 0) {
      const targetIdx = explorer.historyIndex - 1;
      const targetPath = explorer.history[targetIdx];
      await browseDirectory(targetPath);
      set((state) => ({
        explorer: { ...state.explorer, historyIndex: targetIdx },
      }));
    }
  },

  navigateForward: async () => {
    const { explorer, browseDirectory } = get();
    if (explorer.historyIndex < explorer.history.length - 1) {
      const targetIdx = explorer.historyIndex + 1;
      const targetPath = explorer.history[targetIdx];
      await browseDirectory(targetPath);
      set((state) => ({
        explorer: { ...state.explorer, historyIndex: targetIdx },
      }));
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

  setLanguage: (lang: Language) => {
    set({ language: lang });
    saveStoredSettings({
      language: lang,
      appearance: get().appearance,
      librarySettings: get().librarySettings,
    });
  },

  setAppearance: (patch: Partial<AppearanceState>) => {
    set((state) => {
      const next = { ...state.appearance, ...patch };
      saveStoredSettings({
        language: state.language,
        appearance: next,
        librarySettings: state.librarySettings,
      });
      return { appearance: next };
    });
  },

  setLibrarySettings: (patch: Partial<LibrarySettings>) => {
    set((state) => {
      const next = { ...state.librarySettings, ...patch };
      saveStoredSettings({
        language: state.language,
        appearance: state.appearance,
        librarySettings: next,
      });
      return { librarySettings: next };
    });
  },

  setSettingsOpen: (open: boolean) => {
    set({ isSettingsOpen: open });
  },

  fetchTrackCoverArt: async (filepath: string) => {
    const cache = get().coverArtCache;
    if (cache[filepath]) {
      set({ currentCoverArt: cache[filepath] });
      return cache[filepath];
    }
    try {
      const cover = await api.getTrackCoverArt(filepath);
      if (cover) {
        set((state) => ({
          currentCoverArt: cover,
          coverArtCache: { ...state.coverArtCache, [filepath]: cover },
        }));
        return cover;
      }
    } catch {
      // Ignore
    }
    set({ currentCoverArt: null });
    return null;
  },

  saveWindowSize: async () => {
    // Persist layout & appearance settings into local storage
    saveStoredSettings({
      language: get().language,
      appearance: get().appearance,
      librarySettings: get().librarySettings,
    });
  },

  updateTelemetry: (telemetry: AudioTelemetry) => {
    set((state) => {
      // Auto fetch cover art when track changes
      if (telemetry.filepath && telemetry.filepath !== state.telemetry.filepath) {
        get().fetchTrackCoverArt(telemetry.filepath);
      }
      return {
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
      };
    });
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

export const useAppStore = useMusicStore;
