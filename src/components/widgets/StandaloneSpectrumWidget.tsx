import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { Activity } from "lucide-react";
import { SpectrumVisualizer } from "./SpectrumVisualizer.tsx";

export const StandaloneSpectrumWidget: React.FC = () => {
  const { appearance } = useMusicStore();

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Activity size={12} style={{ color: appearance.accentColor }} className="animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-audiophile-muted">
            Espectro de Frecuencias
          </span>
        </div>

        <span className="text-[9px] font-mono text-slate-500">
          Doble clic para cambiar estilo
        </span>
      </div>

      <div className="flex-1 p-2 flex flex-col justify-end bg-slate-950 relative overflow-hidden">
        <SpectrumVisualizer />
      </div>
    </div>
  );
};
