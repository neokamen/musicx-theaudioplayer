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

export interface AudioSettingsState {
  allowExtraVolumeBoost: boolean;
  resamplingQuality: "bit_perfect" | "symphonia_96k" | "float32";
  bufferLatency: "ultra_low" | "low" | "stable";
  crossfadeMs: number;
  ditherEngine: "tpdf" | "none";
  isEqEnabled: boolean;
  isNormalizerEnabled: boolean;
  isXdssEnabled: boolean;
  isXtsProEnabled: boolean;
  tubeWarmth: boolean;
  eqGains: number[];
}

export interface PlaybackSettingsState {
  crossfadeDurationSec: number;
  gaplessPlayback: boolean;
  replayGainMode: "track" | "album" | "off";
  autoPlayOnDrop: boolean;
  playerBarStyle: "classic" | "spectrum" | "hybrid";
  diffuseAlbumArt: boolean;
  diffuseAlbumArtOpacity: number;
}

export interface ListeningStatsState {
  totalTracksPlayed: number;
  totalSecondsListened: number;
  totalSessions: number;
}

export interface LibrarySettings {
  musicFolder: string;
  autoScanOnStartup: boolean;
  totalHoursOverride?: number;
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
  audioSettings: AudioSettingsState;
  playbackSettings: PlaybackSettingsState;
  listeningStats: ListeningStatsState;
  librarySettings: LibrarySettings;
  isSettingsOpen: boolean;
  currentCoverArt: string | null;
  coverArtCache: Record<string, string>;

  // Actions
  setAudioSettings: (settings: Partial<AudioSettingsState>) => void;
  setPlaybackSettings: (settings: Partial<PlaybackSettingsState>) => void;
  resetStats: () => void;
  setListeningStats: (stats: Partial<ListeningStatsState>) => void;
  resetSettings: () => void;
  clearCacheAndResidues: () => void;
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

const SETTINGS_STORAGE_KEY = "musicx_settings_v5";

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

const defaultAudioSettings: AudioSettingsState = {
  allowExtraVolumeBoost: true,
  resamplingQuality: "bit_perfect",
  bufferLatency: "ultra_low",
  crossfadeMs: 0,
  ditherEngine: "tpdf",
  isEqEnabled: false,
  isNormalizerEnabled: true,
  isXdssEnabled: false,
  isXtsProEnabled: false,
  tubeWarmth: false,
  eqGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

const defaultPlaybackSettings: PlaybackSettingsState = {
  crossfadeDurationSec: 0,
  gaplessPlayback: true,
  replayGainMode: "track",
  autoPlayOnDrop: true,
  playerBarStyle: "hybrid",
  diffuseAlbumArt: true,
  diffuseAlbumArtOpacity: 25,
};

const defaultListeningStats: ListeningStatsState = {
  totalTracksPlayed: 142,
  totalSecondsListened: 28540,
  totalSessions: 18,
};

const defaultLibrarySettings: LibrarySettings = {
  musicFolder: "/home",
  autoScanOnStartup: true,
  totalHoursOverride: 7.9,
};

function loadStoredSettings(): {
  language: Language;
  appearance: AppearanceState;
  audioSettings: AudioSettingsState;
  playbackSettings: PlaybackSettingsState;
  listeningStats: ListeningStatsState;
  librarySettings: LibrarySettings;
} {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        language: parsed.language || "es",
        appearance: { ...defaultAppearance, ...(parsed.appearance || {}) },
        audioSettings: { ...defaultAudioSettings, ...(parsed.audioSettings || {}) },
        playbackSettings: { ...defaultPlaybackSettings, ...(parsed.playbackSettings || {}) },
        listeningStats: { ...defaultListeningStats, ...(parsed.listeningStats || {}) },
        librarySettings: { ...defaultLibrarySettings, ...(parsed.librarySettings || {}) },
      };
    }
  } catch {
    // Fallback on parse failure
  }
  return {
    language: "es",
    appearance: defaultAppearance,
    audioSettings: defaultAudioSettings,
    playbackSettings: defaultPlaybackSettings,
    listeningStats: defaultListeningStats,
    librarySettings: defaultLibrarySettings,
  };
}

function saveStoredSettings(state: {
  language: Language;
  appearance: AppearanceState;
  audioSettings: AudioSettingsState;
  playbackSettings: PlaybackSettingsState;
  listeningStats: ListeningStatsState;
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
  spectrum: [],
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
  audioSettings: stored.audioSettings,
  playbackSettings: stored.playbackSettings,
  listeningStats: stored.listeningStats,
  librarySettings: stored.librarySettings,
  isSettingsOpen: false,
  currentCoverArt: null,
  coverArtCache: {},

  play: async (track?: Track) => {
    const targetTrack = track ?? get().currentTrack;
    if (!targetTrack) return;

    const { bitPerfectMode, selectedDevice, fetchTrackCoverArt, listeningStats } = get();

    await api.playTrack(
      targetTrack.filepath,
      bitPerfectMode,
      selectedDevice === "Default" ? undefined : selectedDevice
    );

    // Fetch cover art concurrently
    fetchTrackCoverArt(targetTrack.filepath);

    // Update listening stats
    const nextStats = {
      ...listeningStats,
      totalTracksPlayed: listeningStats.totalTracksPlayed + 1,
      totalSessions: listeningStats.totalSessions + 1,
    };

    set((state) => {
      const idx = state.queue.findIndex((t) => t.filepath === targetTrack.filepath);
      let newQueue = state.queue;
      let newIdx = idx;

      if (idx === -1) {
        newQueue = [...state.queue, targetTrack];
        newIdx = newQueue.length - 1;
      }

      saveStoredSettings({
        language: state.language,
        appearance: state.appearance,
        audioSettings: state.audioSettings,
        playbackSettings: state.playbackSettings,
        listeningStats: nextStats,
        librarySettings: state.librarySettings,
      });

      return {
        currentTrack: targetTrack,
        isPlaying: true,
        queue: newQueue,
        queueIndex: newIdx,
        listeningStats: nextStats,
      };
    });
  },

  pause: async () => {
    await api.pauseAudio();
    set({ isPlaying: false });
  },

  resume: async () => {
    await api.resumeAudio();
    set({ isPlaying: true });
  },

  stop: async () => {
    await api.stopAudio();
    set({ isPlaying: false });
  },

  togglePlayPause: async () => {
    const { isPlaying, currentTrack, queue, play, pause, resume } = get();
    if (isPlaying) {
      await pause();
    } else if (currentTrack) {
      await resume();
    } else if (queue.length > 0) {
      await play(queue[0]);
    }
  },

  seek: async (seconds: number) => {
    await api.seekAudio(seconds);
    set((state) => ({
      telemetry: { ...state.telemetry, current_time: seconds },
    }));
  },

  setVolume: async (vol: number) => {
    await api.setVolume(vol);
    set({ volume: vol });
  },

  nextTrack: async () => {
    const { queue, queueIndex, shuffle, repeat, play } = get();
    if (queue.length === 0) return;

    let nextIndex = queueIndex + 1;

    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeat === "all") {
        nextIndex = 0;
      } else {
        return;
      }
    }

    const nextTrk = queue[nextIndex];
    if (nextTrk) {
      await play(nextTrk);
    }
  },

  previousTrack: async () => {
    const { queue, queueIndex, telemetry, seek, play } = get();
    if (queue.length === 0) return;

    if (telemetry.current_time > 3) {
      await seek(0);
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    const prevTrk = queue[prevIndex];
    if (prevTrk) {
      await play(prevTrk);
    }
  },

  setQueue: async (tracks: Track[], startIndex = 0) => {
    set({
      queue: tracks,
      queueIndex: startIndex,
    });
    if (tracks.length > 0 && startIndex >= 0 && startIndex < tracks.length) {
      await get().play(tracks[startIndex]);
    }
  },

  addToQueue: (track: Track | Track[]) => {
    set((state) => {
      const toAdd = Array.isArray(track) ? track : [track];
      return { queue: [...state.queue, ...toAdd] };
    });
  },

  removeFromQueue: (index: number) => {
    set((state) => {
      const nextQueue = [...state.queue];
      nextQueue.splice(index, 1);
      let nextIndex = state.queueIndex;
      if (index < state.queueIndex) {
        nextIndex--;
      } else if (index === state.queueIndex) {
        if (nextIndex >= nextQueue.length) {
          nextIndex = nextQueue.length - 1;
        }
      }
      return { queue: nextQueue, queueIndex: nextIndex };
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
      const currentIdx = modes.indexOf(state.repeat);
      const nextIdx = (currentIdx + 1) % modes.length;
      return { repeat: modes[nextIdx] };
    });
  },

  setBitPerfectMode: async (enabled: boolean) => {
    await api.setBitPerfect(enabled);
    set({ bitPerfectMode: enabled });
  },

  setOutputDevice: async (deviceName: string) => {
    await api.setOutputDevice(deviceName);
    set({ selectedDevice: deviceName });
  },

  refreshAudioDevices: async () => {
    try {
      const devices = await api.getAudioDevices();
      set({ availableDevices: devices });
    } catch {
      // Ignore
    }
  },

  fetchLibraryTracks: async (query?: string) => {
    try {
      const tracks = await api.searchTracks(query || "");
      set({
        libraryTracks: tracks,
        librarySearchQuery: query || "",
      });
    } catch {
      // Ignore
    }
  },

  startDirectoryScan: async (path: string, force = false) => {
    try {
      await api.scanDirectory(path, force);
    } catch {
      // Ignore
    }
  },

  browseDirectory: async (path: string) => {
    set((state) => ({
      explorer: { ...state.explorer, isLoading: true, error: null },
    }));
    try {
      const entries = await api.readDirectory(path);
      set((state) => {
        const history = [...state.explorer.history];
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

  setAudioSettings: (patch: Partial<AudioSettingsState>) => {
    set((state) => {
      const next = { ...state.audioSettings, ...patch };
      saveStoredSettings({
        language: state.language,
        appearance: state.appearance,
        audioSettings: next,
        playbackSettings: state.playbackSettings,
        listeningStats: state.listeningStats,
        librarySettings: state.librarySettings,
      });
      // Synchronize DSP with Rust backend
      api.setDspSettings({
        is_eq_enabled: next.isEqEnabled,
        eq_gains: next.eqGains,
        is_normalizer_enabled: next.isNormalizerEnabled,
        is_xdss_enabled: next.isXdssEnabled,
        is_xts_pro_enabled: next.isXtsProEnabled,
        tube_warmth: next.tubeWarmth,
      }).catch(() => {});
      return { audioSettings: next };
    });
  },

  setPlaybackSettings: (patch: Partial<PlaybackSettingsState>) => {
    set((state) => {
      const next = { ...state.playbackSettings, ...patch };
      saveStoredSettings({
        language: state.language,
        appearance: state.appearance,
        audioSettings: state.audioSettings,
        playbackSettings: next,
        listeningStats: state.listeningStats,
        librarySettings: state.librarySettings,
      });
      return { playbackSettings: next };
    });
  },

  resetStats: () => {
    const freshStats: ListeningStatsState = {
      totalTracksPlayed: 0,
      totalSecondsListened: 0,
      totalSessions: 0,
    };
    set((state) => {
      saveStoredSettings({
        language: state.language,
        appearance: state.appearance,
        audioSettings: state.audioSettings,
        playbackSettings: state.playbackSettings,
        listeningStats: freshStats,
        librarySettings: state.librarySettings,
      });
      return { listeningStats: freshStats };
    });
  },

  setListeningStats: (patch: Partial<ListeningStatsState>) => {
    set((state) => {
      const next = { ...state.listeningStats, ...patch };
      saveStoredSettings({
        language: state.language,
        appearance: state.appearance,
        audioSettings: state.audioSettings,
        playbackSettings: state.playbackSettings,
        listeningStats: next,
        librarySettings: state.librarySettings,
      });
      return { listeningStats: next };
    });
  },

  resetSettings: () => {
    set((state) => {
      const resetLang: Language = "es";
      const resetApp = { ...defaultAppearance };
      const resetAud = { ...defaultAudioSettings };
      const resetPlay = { ...defaultPlaybackSettings };
      const resetLib = { ...defaultLibrarySettings };
      saveStoredSettings({
        language: resetLang,
        appearance: resetApp,
        audioSettings: resetAud,
        playbackSettings: resetPlay,
        listeningStats: state.listeningStats,
        librarySettings: resetLib,
      });
      return {
        language: resetLang,
        appearance: resetApp,
        audioSettings: resetAud,
        playbackSettings: resetPlay,
        librarySettings: resetLib,
      };
    });
  },

  clearCacheAndResidues: () => {
    try {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {
      // Ignore
    }
    set({
      coverArtCache: {},
      currentCoverArt: null,
      queue: [],
      queueIndex: -1,
    });
  },

  setLanguage: (lang: Language) => {
    set((state) => {
      saveStoredSettings({
        language: lang,
        appearance: state.appearance,
        audioSettings: state.audioSettings,
        playbackSettings: state.playbackSettings,
        listeningStats: state.listeningStats,
        librarySettings: state.librarySettings,
      });
      return { language: lang };
    });
  },

  setAppearance: (patch: Partial<AppearanceState>) => {
    set((state) => {
      const next = { ...state.appearance, ...patch };
      saveStoredSettings({
        language: state.language,
        appearance: next,
        audioSettings: state.audioSettings,
        playbackSettings: state.playbackSettings,
        listeningStats: state.listeningStats,
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
        audioSettings: state.audioSettings,
        playbackSettings: state.playbackSettings,
        listeningStats: state.listeningStats,
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
    saveStoredSettings({
      language: get().language,
      appearance: get().appearance,
      audioSettings: get().audioSettings,
      playbackSettings: get().playbackSettings,
      listeningStats: get().listeningStats,
      librarySettings: get().librarySettings,
    });
  },

  updateTelemetry: (telemetry: AudioTelemetry) => {
    set((state) => {
      // Auto fetch cover art when track changes
      if (telemetry.filepath && telemetry.filepath !== state.telemetry.filepath) {
        get().fetchTrackCoverArt(telemetry.filepath);
      }

      // Calculate time delta for active listening telemetry
      let updatedStats = state.listeningStats;
      if (telemetry.state === "Playing" && telemetry.current_time > state.telemetry.current_time) {
        const delta = Math.min(2, Math.max(0, telemetry.current_time - state.telemetry.current_time));
        if (delta > 0) {
          const nextSecs = state.listeningStats.totalSecondsListened + delta;
          updatedStats = { ...state.listeningStats, totalSecondsListened: nextSecs };
          // Cache to localStorage periodically
          if (Math.floor(nextSecs) % 10 === 0) {
            saveStoredSettings({
              language: state.language,
              appearance: state.appearance,
              audioSettings: state.audioSettings,
              playbackSettings: state.playbackSettings,
              listeningStats: updatedStats,
              librarySettings: state.librarySettings,
            });
          }
        }
      }

      return {
        telemetry,
        isPlaying: telemetry.state === "Playing",
        volume: telemetry.volume,
        bitPerfectMode: telemetry.is_bit_perfect,
        selectedDevice: telemetry.output_device,
        listeningStats: updatedStats,
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
