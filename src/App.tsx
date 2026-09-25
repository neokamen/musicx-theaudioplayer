import { useEffect } from "react";
import { LayoutManager } from "./components/layout/LayoutManager.tsx";
import { HiFiPlayerBar } from "./components/player/HiFiPlayerBar.tsx";
import { SettingsModal } from "./components/settings/SettingsModal.tsx";
import { useMusicStore } from "./store/index.ts";

export default function App() {
  const { initListeners, telemetry, appearance, setSettingsOpen } = useMusicStore();

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initListeners().then((unlisten: () => void) => {
      cleanup = unlisten;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [initListeners]);

  // CSS variables for dynamic accent and custom styling
  const customStyles: React.CSSProperties = {
    backgroundColor: appearance.bgColor || "#090d16",
    color: "#f8fafc",
    backdropFilter: appearance.glassmorphism
      ? `blur(${appearance.glassBlur}px)`
      : "none",
  };

  return (
    <div
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
