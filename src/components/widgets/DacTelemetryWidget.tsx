import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { Activity, ShieldCheck } from "lucide-react";
import { SpectrumVisualizer } from "./SpectrumVisualizer.tsx";

export const DacTelemetryWidget: React.FC = () => {
  const {
    telemetry,
    currentTrack,
    bitPerfectMode,
    appearance,
    setBitPerfectMode,
  } = useMusicStore();

  const isBitPerfect = bitPerfectMode || telemetry.is_bit_perfect;
  const sampleRateKhz = telemetry.sample_rate > 0
    ? (telemetry.sample_rate / 1000).toFixed(1)
    : "44.1";
  const bitDepth = telemetry.bits_per_sample > 0
    ? `${telemetry.bits_per_sample}-bit`
    : "16-bit";
  const bitrate = telemetry.bitrate || currentTrack?.bitrate_kbps || 1411;

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      {/* Header without extra box */}
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-wider text-audiophile-muted flex items-center gap-1.5">
          <Activity size={12} style={{ color: appearance.accentColor }} className="animate-pulse" />
          Telemetría DAC / ALSA Direct
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 font-mono">
        {/* Gran Display VFD / LED Digital de Resolución con Bitrate debajo */}
        <div
          className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center shadow-inner relative overflow-hidden"
          style={{
            borderColor: appearance.neonGlow ? `${appearance.accentColor}33` : undefined,
          }}
        >
          <div className="text-[9px] uppercase text-slate-400 tracking-widest mb-0.5">
            DAC MASTER CLOCK & SAMPLE RATE
          </div>

          <div
            className="text-2xl font-black tracking-wider"
            style={{ color: appearance.accentColor }}
          >
            {sampleRateKhz} <span className="text-xs font-normal text-slate-400">kHz</span>
          </div>

          {/* Bitrate en tiempo real debajo de los kHz */}
          <div className="text-xs font-bold text-amber-400 mt-0.5">
            {bitrate} <span className="text-[10px] font-normal text-slate-400">kbps (Real-time Stream)</span>
          </div>

          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-slate-300 border-t border-slate-800/80 pt-1.5">
            <span>PROFUNDIDAD: <strong className="text-cyan-300">{bitDepth}</strong></span>
            <span>&bull;</span>
            <span>
              ESTADO:{" "}
              <strong className={telemetry.state === "Playing" ? "text-emerald-400 font-bold" : "text-slate-500"}>
                {telemetry.state.toUpperCase()}
              </strong>
            </span>
          </div>
        </div>

        {/* Botón Bit-Perfect con efecto luminoso de contorno */}
        <button
          onClick={() => setBitPerfectMode(!isBitPerfect)}
          className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center gap-2 border ${
            isBitPerfect
              ? "bg-slate-900 text-white"
              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
          }`}
          style={{
            borderColor: isBitPerfect ? appearance.accentColor : undefined,
            boxShadow: isBitPerfect
              ? `0 0 15px ${appearance.accentColor}55, inset 0 0 10px ${appearance.accentColor}22`
              : "none",
            color: isBitPerfect ? appearance.accentColor : undefined,
          }}
        >
          <ShieldCheck size={14} style={{ color: isBitPerfect ? appearance.accentColor : undefined }} />
          <span>{isBitPerfect ? "ALSA BIT-PERFECT: ACTIVADO" : "MODO COMPARTIDO (PIPEWIRE)"}</span>
        </button>

        {/* Espectro a tiempo real debajo de latencia */}
        <div className="flex-1 min-h-[100px] rounded-lg bg-slate-950 border border-slate-800/80 p-1 flex flex-col justify-end overflow-hidden">
          <SpectrumVisualizer height={105} />
        </div>
      </div>
    </div>
  );
};
