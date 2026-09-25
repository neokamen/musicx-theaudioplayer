import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { Activity } from "lucide-react";
import { SpectrumVisualizer, SPECTRUM_STYLES, type SpectrumStyle } from "./SpectrumVisualizer.tsx";

export const StandaloneSpectrumWidget: React.FC = () => {
  const { appearance, setAppearance } = useMusicStore();

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Activity size={12} style={{ color: appearance.accentColor }} className="animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-audiophile-muted">
            Espectro de Frecuencias
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector rápido de estilo */}
          <select
            value={appearance.spectrumStyle || "bars"}
            onChange={(e) => setAppearance({ spectrumStyle: e.target.value as SpectrumStyle })}
            className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-300 focus:outline-none"
            title="Estilo del espectro"
          >
            {SPECTRUM_STYLES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          {/* Selector de FPS */}
          <select
            value={appearance.spectrumFps || 60}
            onChange={(e) => setAppearance({ spectrumFps: Number(e.target.value) as 30 | 60 | 120 })}
            className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] font-mono text-cyan-300 focus:outline-none"
            title="Tasa de refresco"
          >
            <option value={30}>30 FPS</option>
            <option value={60}>60 FPS</option>
            <option value={120}>120 FPS</option>
          </select>
        </div>
      </div>

      <div className="flex-1 p-2 flex flex-col justify-end bg-slate-950 relative overflow-hidden">
        <SpectrumVisualizer height={160} />
      </div>
    </div>
  );
};
