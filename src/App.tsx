import { useEffect, useState } from "react";
import { Check, Settings, SlidersHorizontal } from "lucide-react";
import { LayoutManager } from "./components/layout/LayoutManager.tsx";
import { HiFiPlayerBar } from "./components/player/HiFiPlayerBar.tsx";
import { SettingsModal } from "./components/settings/SettingsModal.tsx";
import { AudioEQModal } from "./components/audio/AudioEQModal.tsx";
import { useMusicStore } from "./store/index.ts";
import { initTheme } from "./lib/theme.ts";

export default function App() {
  const {
    initListeners,
    appearance,
    playbackSettings,
    isPlaying,
    listeningStats,
    setSettingsOpen,
    addToQueue,
    play,
  } = useMusicStore();

  const [isAudioEqOpen, setIsAudioEqOpen] = useState(false);
  const [isLayoutEditing, setIsLayoutEditing] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [playerBarHeightRatio, setPlayerBarHeightRatio] = useState(() => {
    const savedRatio = Number(localStorage.getItem("musicx_playerbar_height_ratio"));
    return Number.isFinite(savedRatio) && savedRatio >= 0.06 && savedRatio <= 0.42 ? savedRatio : 0.18;
  });
  const playerBarHeight = Math.max(88, Math.min(viewportHeight * 0.42, Math.round(viewportHeight * playerBarHeightRatio)));
  const totalListenedSeconds = Math.max(0, Math.floor(listeningStats.totalSecondsListened));
  const listenedYears = Math.floor(totalListenedSeconds / 31_536_000);
  const listenedMonths = Math.floor((totalListenedSeconds % 31_536_000) / 2_592_000);
  const listenedDays = Math.floor((totalListenedSeconds % 2_592_000) / 86_400);
  const listenedClock = totalListenedSeconds % 86_400;
  const listenedTime = [
    Math.floor(listenedClock / 3600),
    Math.floor((listenedClock % 3600) / 60),
    listenedClock % 60,
  ].map((part) => String(part).padStart(2, "0")).join(":");
  const bpm = playbackSettings.bpmValue || 128;

  useEffect(() => {
    initTheme();
    let cleanup: (() => void) | undefined;
    initListeners().then((unlisten: () => void) => {
      cleanup = unlisten;
    });

    return () => {
    cleanup?.();
    };
  }, [initListeners]);

  useEffect(() => {
    const updateViewportHeight = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", updateViewportHeight);
    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const audioFiles = files.filter((f) =>
        /\.(mp3|flac|wav|ogg|m4a|aac|opus|alac)$/i.test(f.name)
      );
      const newTracks = audioFiles.map((f, idx) => ({
          filepath: (f as { path?: string }).path || f.name,
          title: f.name.replace(/\.[^/.]+$/, ""),
          artist: "Archivo Arrastrado",
          album: "Cola Temporal",
          track_number: idx + 1,
          duration_seconds: 0,
          format: f.name.split(".").pop()?.toUpperCase() || "AUDIO",
          sample_rate: 44100,
          bit_depth: 16,
          bitrate_kbps: 1411,
          file_size: f.size,
          mtime: Date.now(),
        }));
        addToQueue(newTracks);
        if (playbackSettings?.autoPlayOnDrop && newTracks.length > 0) {
          play(newTracks[0]);
        }
    }
  };

  const customStyles: React.CSSProperties = {
    backgroundColor: "var(--app-bg)",
    color: "var(--app-text)",
    backdropFilter: appearance.glassmorphism
      ? `blur(${appearance.glassBlur}px)`
      : "none",
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex flex-col h-screen w-screen text-slate-100 select-none font-sans overflow-hidden transition-colors duration-300"
      style={customStyles}
    >
      <header className="h-11 border-b border-slate-800/80 bg-slate-950/90 flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src="/musicx-banner.png"
              alt="MusicX Banner"
              className="h-7 w-auto object-contain max-w-[140px]"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/musicx-logo.png";
              }}
            />
          </div>

          <span
            className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 font-mono tracking-wider"
            style={{ color: appearance.accentColor || "#06b6d4" }}
          >
            Hi-Fi Bit-Perfect Core
          </span>
          <span className="hidden lg:inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-[10px] text-slate-400" title="Tiempo total de reproducción acumulado">
            <span
              className={`h-1.5 w-1.5 rounded-full ${isPlaying ? "bg-emerald-400" : "bg-slate-500"}`}
              style={isPlaying ? { animation: `bpm-beat-glow ${60 / bpm}s ease-in-out infinite` } : undefined}
            />
            <span style={{ color: appearance.accentColor || "#06b6d4" }}>In Play:</span>
            <span>{listenedYears}y {listenedMonths}m {listenedDays}d {listenedTime}</span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3 font-mono text-[11px] text-slate-400">
          <span className="text-[10px] hidden sm:inline text-slate-500">ALSA / PIPEWIRE DIRECT</span>

          <button
            onClick={() => setIsAudioEqOpen(true)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border font-sans font-semibold transition cursor-pointer"
            style={{
              borderColor: `${appearance.accentColor || "#06b6d4"}50`,
              backgroundColor: `${appearance.accentColor || "#06b6d4"}15`,
              color: appearance.accentColor || "#06b6d4",
            }}
            title="Abrir Audio EQ PRO completo tipo Soundix"
          >
            <SlidersHorizontal size={13} />
            <span>Audio EQ PRO</span>
          </button>

          <button
            onClick={() => setIsLayoutEditing((editing) => !editing)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer font-sans"
            style={{
              borderColor: `${appearance.accentColor || "#06b6d4"}50`,
              backgroundColor: isLayoutEditing ? `${appearance.accentColor || "#06b6d4"}25` : "transparent",
              color: appearance.accentColor || "#06b6d4",
            }}
            title={isLayoutEditing ? "Guardar distribución" : "Editar interfaz"}
          >
            {isLayoutEditing ? <Check size={13} /> : <SlidersHorizontal size={13} />}
            <span>{isLayoutEditing ? "Guardar Layout" : "Editar Interfaz"}</span>
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer font-sans"
          >
            <Settings size={13} />
            <span>Ajustes</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full overflow-hidden">
        <LayoutManager isEditing={isLayoutEditing} />
      </main>

      <HiFiPlayerBar
        height={playerBarHeight}
        isEditing={isLayoutEditing}
        onHeightChange={(height) => {
          const nextRatio = Math.max(0.06, Math.min(0.42, height / window.innerHeight));
          setPlayerBarHeightRatio(nextRatio);
          localStorage.setItem("musicx_playerbar_height_ratio", String(nextRatio));
        }}
      />

      <AudioEQModal isOpen={isAudioEqOpen} onClose={() => setIsAudioEqOpen(false)} />

      <SettingsModal />
    </div>
  );
}
