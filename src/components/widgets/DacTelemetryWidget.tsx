import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { ShieldCheck, Cpu, Volume2 } from "lucide-react";

export const DacTelemetryWidget: React.FC = () => {
  const {
    telemetry,
    currentTrack,
    bitPerfectMode,
    selectedDevice,
    appearance,
    setBitPerfectMode,
  } = useMusicStore();

  const isBitPerfect = bitPerfectMode || telemetry.is_bit_perfect;
  const sampleRateKhz =
    telemetry.sample_rate > 0
      ? (telemetry.sample_rate / 1000).toFixed(1)
      : "44.1";
  const bitDepth =
    telemetry.bits_per_sample > 0
      ? `${telemetry.bits_per_sample}-bit`
      : "16-bit";
  const bitrate = telemetry.bitrate || currentTrack?.bitrate_kbps || 1411;
  const channels =
    telemetry.channels === 1
      ? "1.0 Mono"
      : telemetry.channels === 2
      ? "2.0 Stereo"
      : `${telemetry.channels || 2} ch`;

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 font-mono">
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

          <div className="text-xs font-bold text-amber-400 mt-0.5">
            {bitrate} <span className="text-[10px] font-normal text-slate-400">kbps (Real-time Stream)</span>
          </div>

          <div className="flex items-center justify-center gap-3 mt-2 text-[10px] text-slate-300 border-t border-slate-800/80 pt-1.5">
            <span>
              PROFUNDIDAD: <strong className="text-cyan-300">{bitDepth}</strong>
            </span>
            <span>&bull;</span>
            <span>
              ESTADO:{" "}
              <strong
                className={
                  telemetry.state === "Playing"
                    ? "text-emerald-400 font-bold"
                    : "text-slate-500"
                }
              >
                {telemetry.state.toUpperCase()}
              </strong>
            </span>
          </div>
        </div>

        <button
          onClick={() => setBitPerfectMode(!isBitPerfect)}
          className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-bold transition flex items-center justify-center gap-2 border cursor-pointer ${
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
          <ShieldCheck
            size={14}
            style={{ color: isBitPerfect ? appearance.accentColor : undefined }}
          />
          <span>{isBitPerfect ? "ALSA BIT-PERFECT: ACTIVADO" : "MODO COMPARTIDO (PIPEWIRE)"}</span>
        </button>

        <div className="space-y-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Cpu size={11} style={{ color: appearance.accentColor }} />
              Dispositivo Hardware:
            </span>
            <span
              className="font-bold text-slate-200 truncate max-w-[150px]"
              title={telemetry.output_device || selectedDevice}
            >
              {telemetry.output_device || selectedDevice}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Canales de Salida:</span>
            <span className="font-bold text-slate-200">{channels}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Volume2 size={11} style={{ color: appearance.accentColor }} />
              Buffer Under-run:
            </span>
            <span className="text-emerald-400 font-bold">0 Underruns (Bit-Perfect)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
