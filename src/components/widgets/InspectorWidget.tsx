import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { FileAudio, Info, Cpu, Layers, HardDrive } from "lucide-react";

export const InspectorWidget: React.FC = () => {
  const { currentTrack, telemetry } = useMusicStore();

  const title = telemetry.track_title || currentTrack?.title || "Ninguna pista seleccionada";
  const artist = telemetry.track_artist || currentTrack?.artist || "---";
  const album = telemetry.track_album || currentTrack?.album || "---";
  const format = currentTrack?.format || (telemetry.filepath ? telemetry.filepath.split(".").pop()?.toUpperCase() : "PCM");
  const sampleRate = telemetry.sample_rate || currentTrack?.sample_rate || 44100;
  const bitDepth = telemetry.bits_per_sample || currentTrack?.bit_depth || 16;
  const bitrate = telemetry.bitrate || currentTrack?.bitrate_kbps || 1411;
  const channels = telemetry.channels === 1 ? "Mono (1.0)" : telemetry.channels === 2 ? "Stereo (2.0)" : `${telemetry.channels} ch`;
  const fileSizeMb = currentTrack?.file_size ? (currentTrack.file_size / (1024 * 1024)).toFixed(2) : "---";

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-audiophile-muted flex items-center gap-1.5">
          <Info size={12} className="text-audiophile-cyan" />
          Inspector Técnico & Metadata
        </span>
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-audiophile-border text-audiophile-text">
          SPECIFICATIONS
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {/* Track Title & Artist */}
        <div className="bg-audiophile-base border border-audiophile-border rounded-lg p-2.5">
          <div className="text-[10px] font-mono text-audiophile-muted uppercase">Pista Activa</div>
          <div className="font-bold text-xs text-white truncate mt-0.5" title={title}>
            {title}
          </div>
          <div className="text-[11px] text-audiophile-cyan truncate mt-0.5" title={`${artist} — ${album}`}>
            {artist} <span className="text-audiophile-muted">&bull;</span> {album}
          </div>
        </div>

        {/* Grid de Especificaciones Técnicas */}
        <div className="w-full grid grid-cols-2 gap-2 font-mono text-[10px]">
          <div className="bg-audiophile-surface2 border border-audiophile-border/70 rounded p-2 flex flex-col justify-between">
            <span className="text-audiophile-muted uppercase text-[9px] flex items-center gap-1">
              <FileAudio size={10} className="text-audiophile-amber" /> Formato / Códec
            </span>
            <span className="font-bold text-audiophile-text mt-1">{format}</span>
          </div>

          <div className="bg-audiophile-surface2 border border-audiophile-border/70 rounded p-2 flex flex-col justify-between">
            <span className="text-audiophile-muted uppercase text-[9px] flex items-center gap-1">
              <Cpu size={10} className="text-audiophile-cyan" /> Bitrate Actual
            </span>
            <span className="font-bold text-audiophile-cyan mt-1">
              {bitrate > 0 ? `${bitrate} kbps` : "1411 kbps"}
            </span>
          </div>

          <div className="bg-audiophile-surface2 border border-audiophile-border/70 rounded p-2 flex flex-col justify-between">
            <span className="text-audiophile-muted uppercase text-[9px] flex items-center gap-1">
              <Layers size={10} className="text-audiophile-green" /> Frecuencia / Bits
            </span>
            <span className="font-bold text-audiophile-text mt-1">
              {sampleRate > 0 ? `${sampleRate / 1000} kHz / ${bitDepth}b` : "44.1 kHz / 16b"}
            </span>
          </div>

          <div className="bg-audiophile-surface2 border border-audiophile-border/70 rounded p-2 flex flex-col justify-between">
            <span className="text-audiophile-muted uppercase text-[9px]">Configuración Canales</span>
            <span className="font-bold text-audiophile-text mt-1">{channels}</span>
          </div>
        </div>

        {/* Ubicación del Archivo y Tamaño */}
        {telemetry.filepath && (
          <div className="w-full bg-audiophile-base border border-audiophile-border rounded p-2 font-mono text-[9px] text-audiophile-muted break-all">
            <div className="flex items-center justify-between text-audiophile-cyan mb-1">
              <span className="flex items-center gap-1">
                <HardDrive size={10} /> Archivo fuente:
              </span>
              <span>{fileSizeMb !== "---" ? `${fileSizeMb} MB` : ""}</span>
            </div>
            {telemetry.filepath}
          </div>
        )}
      </div>
    </div>
  );
};
