import { useEffect } from "react";
import { LayoutManager } from "./components/layout/LayoutManager.tsx";
import { HiFiPlayerBar } from "./components/player/HiFiPlayerBar.tsx";
import { useMusicStore } from "./store/index.ts";

export default function App() {
  const { initListeners, telemetry } = useMusicStore();

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    initListeners().then((unlisten: () => void) => {
      cleanup = unlisten;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [initListeners]);

  return (
    <div className="flex flex-col h-screen w-screen bg-audiophile-base text-audiophile-text select-none font-sans overflow-hidden">
      {/* Barra de Título Superior Hi-Fi */}
      <header className="h-10 border-b border-audiophile-border bg-audiophile-surface flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-audiophile-cyan shadow-sm shadow-audiophile-cyan/50" />
          <span className="font-mono text-xs font-bold tracking-wider text-audiophile-text uppercase">
            musicx &bull; the audio player
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-audiophile-surface2 border border-audiophile-border text-audiophile-amber font-mono">
            Hi-Fi Bit-Perfect Core
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-audiophile-muted">
          <span className="bg-audiophile-surface2 px-2 py-0.5 rounded border border-audiophile-border text-audiophile-cyan">
            {telemetry.sample_rate > 0
              ? `${(telemetry.sample_rate / 1000).toFixed(1)} kHz / ${telemetry.bits_per_sample}b`
              : "READY"}
          </span>
          <span className="text-[10px]">LINUX / ALSA & PIPEWIRE</span>
        </div>
      </header>

      {/* Área Principal: Layout Modular Redimensionable */}
      <main className="flex-1 w-full overflow-hidden">
        <LayoutManager />
      </main>

      {/* Barra de Reproducción y Telemetría Hi-Fi */}
      <HiFiPlayerBar />
    </div>
  );
}
