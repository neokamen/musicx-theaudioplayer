import React, { useEffect } from "react";
import { LayoutManager } from "./components/layout/LayoutManager.tsx";
import { HiFiPlayerBar } from "./components/player/HiFiPlayerBar.tsx";
import { SettingsModal } from "./components/settings/SettingsModal.tsx";
import { useMusicStore } from "./store/index.ts";
import type { Track } from "./types/index.ts";

export default function App() {
  const {
    initListeners,
    telemetry,
    appearance,
    playbackSettings,
    setSettingsOpen,
    addToQueue,
    play,
  } = useMusicStore();

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initListeners().then((unlisten: () => void) => {
      cleanup = unlisten;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [initListeners]);

  // CSS variables for dynamic accent, background, borders, and glassmorphism styling
  const customStyles: React.CSSProperties = {
    backgroundColor: appearance.bgColor || "#090d16",
    color: "#f8fafc",
    backdropFilter: appearance.glassmorphism
      ? `blur(${appearance.glassBlur ?? 10}px)`
      : "none",
    // Custom CSS Properties
    ["--app-bg" as string]: appearance.bgColor || "#090d16",
    ["--app-surface" as string]: appearance.bgColor ? `${appearance.bgColor}f0` : "#0c1220",
    ["--app-surface2" as string]: appearance.bgColor ? `${appearance.bgColor}cc` : "#131b2e",
    ["--app-accent" as string]: appearance.accentColor || "#06b6d4",
    ["--app-border" as string]: appearance.borderEffect
      ? `rgba(255, 255, 255, ${(appearance.borderOpacity ?? 40) / 100})`
      : "rgba(51, 65, 85, 0.4)",
    ["--app-radius" as string]: `${appearance.borderRadius ?? 8}px`,
    ["--app-blur" as string]: `${appearance.glassBlur ?? 10}px`,
  };

  // Drag-and-drop support to enqueue or play dropped files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const audioTracks: Track[] = droppedFiles
        .filter((file) => {
          const ext = file.name.split(".").pop()?.toLowerCase() || "";
          return ["flac", "wav", "mp3", "m4a", "aac", "ogg", "opus", "aiff", "alac", "dsf", "dff"].includes(ext);
        })
        .map((file, idx) => {
          const filePath = (file as unknown as { path?: string }).path || file.name;
          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
          return {
            filepath: filePath,
            title: fileNameWithoutExt,
            artist: "Arrastrado",
            album: "Cola Directa",
            track_number: idx + 1,
            duration_seconds: 0,
            format: file.name.split(".").pop()?.toUpperCase() || "AUDIO",
            sample_rate: 44100,
            bit_depth: 16,
            bitrate_kbps: 1411,
            file_size: file.size,
            mtime: Math.floor(Date.now() / 1000),
          };
        });

      if (audioTracks.length > 0) {
        addToQueue(audioTracks);
        if (playbackSettings.autoPlayOnDrop) {
          play(audioTracks[0]);
        }
      }
    }
  };

  return (
    <div
      className="flex flex-col h-screen w-screen text-slate-100 select-none font-sans overflow-hidden transition-colors duration-300"
      style={customStyles}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Barra de Título Superior Hi-Fi */}
      <header className="h-10 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{
              backgroundColor: appearance.accentColor || "#06b6d4",
              boxShadow: appearance.neonGlow
                ? `0 0 10px ${appearance.accentColor}`
                : "none",
            }}
          />
          <span className="font-mono text-xs font-bold tracking-wider text-slate-200 uppercase">
            musicx &bull; the audio player
          </span>
          <span
            className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 font-mono font-bold"
            style={{
              color: appearance.accentColor,
              boxShadow: appearance.neonGlow ? `0 0 8px ${appearance.accentColor}40` : undefined,
            }}
          >
            Hi-Fi Bit-Perfect Core
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span
            className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
            style={{ color: appearance.accentColor }}
          >
            {telemetry.sample_rate > 0
              ? `${(telemetry.sample_rate / 1000).toFixed(1)} kHz / ${telemetry.bits_per_sample}b`
              : "44.1 kHz / 16b"}
          </span>
          <span className="text-[10px]">LINUX / ALSA & PIPEWIRE</span>

          <button
            onClick={() => setSettingsOpen(true)}
            className="text-xs px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-mono"
            style={{
              borderColor: appearance.neonGlow ? appearance.accentColor : undefined,
            }}
          >
            ⚙ Ajustes
          </button>
        </div>
      </header>

      {/* Área Principal: Layout Modular Redimensionable */}
      <main className="flex-1 w-full overflow-hidden">
        <LayoutManager />
      </main>

      {/* Barra de Reproducción y Telemetría Hi-Fi */}
      <HiFiPlayerBar />

      {/* Modal de Ajustes Globales */}
      <SettingsModal />
    </div>
  );
}
