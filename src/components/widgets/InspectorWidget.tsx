import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { Info, Cpu, Layers, HardDrive } from "lucide-react";

export const InspectorWidget: React.FC = () => {
  const { currentTrack, telemetry, appearance } = useMusicStore();

  const title = telemetry.track_title || currentTrack?.title || "Sin pista activa";
  const artist = telemetry.track_artist || currentTrack?.artist || "---";
  const album = telemetry.track_album || currentTrack?.album || "---";
  const format = currentTrack?.format || (telemetry.filepath ? telemetry.filepath.split(".").pop()?.toUpperCase() : "PCM");
  const sampleRate = telemetry.sample_rate || currentTrack?.sample_rate || 44100;
  const bitDepth = telemetry.bits_per_sample || currentTrack?.bit_depth || 16;
  const bitrate = telemetry.bitrate || currentTrack?.bitrate_kbps || 1411;
  const channels = telemetry.channels === 1 ? "Mono (1.0)" : telemetry.channels === 2 ? "Stereo (2.0)" : `${telemetry.channels || 2} canales`;
  const filepath = telemetry.filepath || currentTrack?.filepath || "---";

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      <div className="p-1.5 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between shrink-0">
        <Info size={12} style={{ color: appearance.accentColor }} />
        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-slate-300">
          METADATA
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 font-mono">
        {/* Track Title & Artist */}
        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
          <div className="text-[10px] uppercase text-slate-400">Pista / Archivo</div>
          <div className="text-xs font-bold text-slate-100 truncate mt-0.5" title={title}>
            {title}
          </div>
          <div className="text-[11px] text-slate-400 truncate">{artist} &bull; {album}</div>
        </div>

        {/* Audio stream properties grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Cpu size={14} style={{ color: appearance.accentColor }} />
            <div>
              <div className="text-[9px] uppercase text-slate-400">Códec / Formato</div>
              <div className="text-xs font-bold text-white">{format}</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Layers size={14} className="text-emerald-400" />
            <div>
              <div className="text-[9px] uppercase text-slate-400">Sample Rate</div>
              <div className="text-xs font-bold text-white">{(sampleRate / 1000).toFixed(1)} kHz</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <HardDrive size={14} className="text-amber-400" />
            <div>
              <div className="text-[9px] uppercase text-slate-400">Profundidad</div>
              <div className="text-xs font-bold text-white">{bitDepth} bits</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2">
            <Cpu size={14} className="text-cyan-400" />
            <div>
              <div className="text-[9px] uppercase text-slate-400">Bitrate</div>
              <div className="text-xs font-bold text-white">{bitrate} kbps</div>
            </div>
          </div>
        </div>

        {/* Canales y Modo */}
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-[11px]">
          <span className="text-slate-400">Canales PCM:</span>
          <span className="font-bold text-slate-200">{channels}</span>
        </div>

        {/* Filepath */}
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 break-all">
          <span className="text-[9px] text-slate-500 uppercase block mb-0.5">Ruta en Disco:</span>
          <span className="text-slate-300 select-all">{filepath}</span>
        </div>
      </div>
    </div>
  );
};
