import { useEffect } from "react";
import { LayoutManager } from "./components/layout/LayoutManager.tsx";
import { HiFiPlayerBar } from "./components/player/HiFiPlayerBar.tsx";
import { SettingsModal } from "./components/settings/SettingsModal.tsx";
import { useMusicStore } from "./store/index.ts";

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

  // Sincronizar variables CSS dinámicas para apariencia en toda la aplicación
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--app-bg", appearance.bgColor || "#090d16");
    root.style.setProperty("--app-surface", appearance.bgColor ? `${appearance.bgColor}ee` : "#0c1220");
    root.style.setProperty("--app-surface2", appearance.bgColor ? `${appearance.bgColor}cc` : "#131b2e");
    root.style.setProperty("--app-accent", appearance.accentColor || "#06b6d4");
    root.style.setProperty(
      "--app-border",
      appearance.borderEffect
        ? `rgba(255, 255, 255, ${(appearance.borderOpacity ?? 40) / 250})`
        : "rgba(51, 65, 85, 0.4)"
    );
    root.style.setProperty("--app-radius", `${appearance.borderRadius ?? 8}px`);
    root.style.setProperty("--app-blur", `${appearance.glassBlur ?? 10}px`);
  }, [appearance]);

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
      if (audioFiles.length > 0) {
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
    }
  };

  const customStyles: React.CSSProperties = {
    backgroundColor: appearance.bgColor || "#090d16",
    color: "#f8fafc",
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
            className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 font-mono"
            style={{ color: appearance.accentColor }}
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
            className="text-xs px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
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
