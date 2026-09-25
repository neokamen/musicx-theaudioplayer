import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { Activity, ShieldCheck, Zap, Sliders, Cpu } from "lucide-react";
import { SpectrumVisualizer } from "./SpectrumVisualizer.tsx";

export const DacTelemetryWidget: React.FC = () => {
  const {
    telemetry,
    bitPerfectMode,
    setBitPerfectMode,
  } = useMusicStore();

  const isBitPerfect = bitPerfectMode || telemetry.is_bit_perfect;
  const sampleRateKhz = telemetry.sample_rate > 0 
    ? (telemetry.sample_rate / 1000).toFixed(1) 
    : "44.1";
  const bitDepth = telemetry.bits_per_sample > 0 
    ? `${telemetry.bits_per_sample}-bit` 
    : "16-bit";
  const bitrate = telemetry.bitrate > 0 ? `${telemetry.bitrate} kbps` : "1411 kbps";

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      {/* Header sin caja a la derecha */}
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-audiophile-muted flex items-center gap-1.5">
          <Activity size={12} className="text-audiophile-cyan animate-pulse" />
          Telemetría DAC / ALSA Direct
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 font-mono">
        {/* Gran Display VFD / LED Digital de Resolución con Bitrate debajo */}
        <div className="bg-audiophile-base border border-audiophile-border rounded-lg p-3 text-center shadow-inner">
          <div className="text-[10px] uppercase text-audiophile-muted tracking-widest mb-1">
            DAC MASTER CLOCK & SAMPLE RATE
          </div>
          <div className="text-2xl font-bold text-audiophile-cyan tracking-wider">
            {sampleRateKhz} <span className="text-sm font-normal text-audiophile-muted">kHz</span>
          </div>

          {/* Bitrate dinámico a tiempo real justo debajo de kHz */}
          <div className="text-xs font-bold text-audiophile-amber tracking-wider mt-1 flex items-center justify-center gap-1">
            <Cpu size={11} />
            <span>{bitrate}</span>
          </div>

          <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-audiophile-text border-t border-audiophile-border/40 pt-2">
            <span>PROFUNDIDAD: <strong className="text-audiophile-amber">{bitDepth}</strong></span>
            <span>&bull;</span>
            <span>ESTADO: <strong className={telemetry.state === "Playing" ? "text-emerald-400" : "text-audiophile-muted"}>{telemetry.state.toUpperCase()}</strong></span>
          </div>
        </div>

        {/* Botón Modo Bit-Perfect Exclusivo con Efecto Glow Iluminado */}
        <button
          onClick={() => setBitPerfectMode(!bitPerfectMode)}
          className={`w-full py-2.5 px-3 rounded-lg border font-mono text-xs flex items-center justify-between transition-all duration-300 ${
            isBitPerfect
              ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/80 shadow-[0_0_18px_rgba(16,185,129,0.35)] hover:border-emerald-400"
              : "bg-audiophile-surface2 text-audiophile-muted border-audiophile-border hover:border-slate-700"
          }`}
        >
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} className={isBitPerfect ? "text-emerald-400 animate-pulse" : ""} />
            <span className="font-bold">ALSA BIT-PERFECT DIRECT</span>
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${isBitPerfect ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400"}`}>
            {isBitPerfect ? "ACTIVO" : "BYPASS"}
          </span>
        </button>

        {/* Telemetría Dinámica de Stream */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-audiophile-surface2 border border-audiophile-border/70 rounded p-2">
            <span className="text-audiophile-muted text-[9px] block">LATENCIA ESTIMADA</span>
            <span className="font-bold text-audiophile-text mt-0.5 block flex items-center gap-1">
              <Zap size={10} className="text-audiophile-cyan" /> ULTRA-LOW (&lt; 5ms)
            </span>
          </div>
          <div className="bg-audiophile-surface2 border border-audiophile-border/70 rounded p-2">
            <span className="text-audiophile-muted text-[9px] block">VOLUMEN INTERNO</span>
            <span className="font-bold text-audiophile-text mt-0.5 block flex items-center gap-1">
              <Sliders size={10} className="text-audiophile-amber" /> {(telemetry.volume * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* ESPECTRO DE AUDIO A TIEMPO REAL */}
        <div className="pt-1">
          <SpectrumVisualizer height={130} />
        </div>
      </div>
    </div>
  );
};
