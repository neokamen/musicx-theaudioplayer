import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { Activity, ShieldCheck, Zap, Speaker, Sliders } from "lucide-react";

export const DacTelemetryWidget: React.FC = () => {
  const {
    telemetry,
    availableDevices,
    selectedDevice,
    bitPerfectMode,
    setOutputDevice,
    setBitPerfectMode,
  } = useMusicStore();

  const isBitPerfect = bitPerfectMode || telemetry.is_bit_perfect;
  const sampleRateKhz = telemetry.sample_rate ? (telemetry.sample_rate / 1000).toFixed(1) : "---";
  const bitDepth = telemetry.bits_per_sample ? `${telemetry.bits_per_sample}-bit` : "---";

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-audiophile-muted flex items-center gap-1.5">
          <Activity size={12} className="text-audiophile-green animate-pulse" />
          Telemetría DAC / ALSA Direct
        </span>
        <span
          className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${
            isBitPerfect
              ? "bg-audiophile-green/10 text-audiophile-green border-audiophile-green/30"
              : "bg-audiophile-border text-audiophile-muted border-transparent"
          }`}
        >
          {isBitPerfect ? "BIT-PERFECT DIRECT" : "SHARED MIXER"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-mono">
        {/* Gran Display VFD / LED Digital de Resolución */}
        <div className="bg-audiophile-base border border-audiophile-border rounded-lg p-3 text-center shadow-inner">
          <div className="text-[10px] uppercase text-audiophile-muted tracking-widest mb-1">
            DAC MASTER CLOCK & SAMPLE RATE
          </div>
          <div className="text-2xl font-bold text-audiophile-cyan tracking-wider">
            {sampleRateKhz} <span className="text-sm font-normal text-audiophile-muted">kHz</span>
          </div>
          <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-audiophile-text border-t border-audiophile-border/40 pt-2">
            <span>PROFUNDIDAD: <strong className="text-audiophile-amber">{bitDepth}</strong></span>
            <span>&bull;</span>
            <span>ESTADO: <strong className={telemetry.state === "Playing" ? "text-audiophile-green" : "text-audiophile-muted"}>{telemetry.state.toUpperCase()}</strong></span>
          </div>
        </div>

        {/* Selector de Dispositivo de Audio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-audiophile-muted uppercase flex items-center gap-1">
            <Speaker size={11} className="text-audiophile-cyan" /> Dispositivo de Salida (CPAL / ALSA / PipeWire)
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => setOutputDevice(e.target.value)}
            className="w-full bg-audiophile-base border border-audiophile-border rounded p-1.5 text-[11px] text-audiophile-text focus:outline-none focus:border-audiophile-cyan"
          >
            {availableDevices.map((dev: string) => (
              <option key={dev} value={dev}>
                {dev}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle Bit-Perfect Exclusivo */}
        <div className="bg-audiophile-surface2 border border-audiophile-border rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={18}
              className={isBitPerfect ? "text-audiophile-green" : "text-audiophile-muted"}
            />
            <div>
              <div className="font-semibold text-white text-[11px]">Modo Bit-Perfect Exclusivo</div>
              <div className="text-[9px] text-audiophile-muted font-sans">
                Evita remuestreo y control de volumen por software del sistema operativo.
              </div>
            </div>
          </div>

          <button
            onClick={() => setBitPerfectMode(!bitPerfectMode)}
            className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
              bitPerfectMode ? "bg-audiophile-green" : "bg-audiophile-border"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                bitPerfectMode ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

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
      </div>
    </div>
  );
};
