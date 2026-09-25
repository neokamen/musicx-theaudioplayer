import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { Sliders, Zap } from "lucide-react";

const EQ_FREQUENCIES = [
  "31Hz",
  "62Hz",
  "125Hz",
  "250Hz",
  "500Hz",
  "1kHz",
  "2kHz",
  "4kHz",
  "8kHz",
  "16kHz",
];

export const EqBarsWidget: React.FC = () => {
  const { audioSettings, setAudioSettings } = useMusicStore();
  const eqGains = audioSettings?.eqGains || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const isEqEnabled = audioSettings?.isEqEnabled ?? false;
  const isXdssEnabled = audioSettings?.isXdssEnabled ?? false;

  const handleGainChange = (bandIndex: number, val: number) => {
    const nextGains = [...eqGains];
    nextGains[bandIndex] = val;
    setAudioSettings({ eqGains: nextGains });
  };

  const handleReset = () => {
    setAudioSettings({ eqGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] });
  };

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-audiophile-muted flex items-center gap-1.5">
          <Sliders size={12} className="text-audiophile-cyan" />
          Ecualizador Gráfico 10 Bandas
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioSettings({ isEqEnabled: !isEqEnabled })}
            className={`font-mono text-[9px] px-2 py-0.5 rounded border transition-all ${
              isEqEnabled
                ? "bg-audiophile-cyan/20 text-audiophile-cyan border-audiophile-cyan/40 shadow-sm shadow-audiophile-cyan/40"
                : "bg-audiophile-border text-audiophile-muted border-transparent"
            }`}
          >
            {isEqEnabled ? "EQ ACTIVADO" : "EQ BYPASS"}
          </button>
        </div>
      </div>

      <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden">
        {/* Sliders de 10 Bandas */}
        <div className="flex-1 flex items-center justify-between gap-1 px-2">
          {EQ_FREQUENCIES.map((freq, idx) => {
            const gain = eqGains[idx] || 0;
            return (
              <div key={freq} className="flex-1 flex flex-col items-center justify-between h-full py-1">
                <span className="text-[9px] font-mono text-audiophile-cyan">
                  {gain > 0 ? `+${gain}` : gain}
                </span>

                <div className="flex-1 flex items-center justify-center my-1 relative w-full">
                  <input
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={gain}
                    disabled={!isEqEnabled}
                    onChange={(e) => handleGainChange(idx, Number(e.target.value))}
                    className="w-20 h-1 appearance-none bg-audiophile-border rounded-lg cursor-pointer accent-audiophile-cyan -rotate-90"
                    title={`${freq}: ${gain} dB`}
                  />
                </div>

                <span className="text-[9px] font-mono text-audiophile-muted tracking-tight">
                  {freq}
                </span>
              </div>
            );
          })}
        </div>

        {/* Barra inferior de opciones rápidas */}
        <div className="pt-2 border-t border-audiophile-border/40 flex items-center justify-between text-[10px] font-mono">
          <button
            onClick={() => setAudioSettings({ isXdssEnabled: !isXdssEnabled })}
            className={`px-2 py-0.5 rounded border flex items-center gap-1 transition-all ${
              isXdssEnabled
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-500/30"
                : "bg-audiophile-surface2 text-audiophile-muted border-audiophile-border"
            }`}
          >
            <Zap size={10} /> XDSS DYNAMIC PUNCH
          </button>

          <button
            onClick={handleReset}
            className="text-audiophile-muted hover:text-white transition-colors"
          >
            Reset Plano (0dB)
          </button>
        </div>
      </div>
    </div>
  );
};
