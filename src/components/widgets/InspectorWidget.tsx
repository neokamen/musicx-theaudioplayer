import React from "react";
import { useMusicStore } from "../../store/index.ts";
import { Disc3, FileAudio, Info, Cpu, Layers } from "lucide-react";

export const InspectorWidget: React.FC = () => {
  const { currentTrack, telemetry } = useMusicStore();

  const title = telemetry.track_title || currentTrack?.title || "Ninguna pista seleccionada";
  const artist = telemetry.track_artist || currentTrack?.artist || "---";
  const album = telemetry.track_album || currentTrack?.album || "---";
  const format = currentTrack?.format || (telemetry.filepath ? telemetry.filepath.split(".").pop()?.toUpperCase() : "PCM");
  const sampleRate = telemetry.sample_rate || currentTrack?.sample_rate || 0;
  const bitDepth = telemetry.bits_per_sample || currentTrack?.bit_depth || 0;
  const bitrate = telemetry.bitrate || currentTrack?.bitrate_kbps || 0;
  const channels = telemetry.channels === 1 ? "Mono" : telemetry.channels === 2 ? "Stereo (2.0)" : `${telemetry.channels} ch`;

  return (
    <div className="flex flex-col h-full w-full bg-audiophile-surface select-none font-sans overflow-hidden text-xs">
      <div className="p-2 border-b border-audiophile-border bg-audiophile-surface2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-audiophile-muted flex items-center gap-1.5">
          <Info size={12} className="text-audiophile-cyan" />
          Inspector & Carátula
        </span>
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-audiophile-border text-audiophile-text">
          METADATA
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center gap-4">
        {/* Simulación de Carátula de Vinilo / Álbum Hi-Fi */}
        <div className="relative w-40 h-40 rounded-lg bg-audiophile-base border border-audiophile-border shadow-xl flex items-center justify-center group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-audiophile-surface to-transparent opacity-60" />
          <Disc3
            size={72}
            className={`text-audiophile-muted/40 transition-transform duration-1000 ${
              telemetry.state === "Playing" ? "animate-spin text-audiophile-cyan/40" : ""
            }`}
            style={{ animationDuration: "6s" }}
          />
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <span className="font-mono text-[9px] uppercase tracking-wider text-audiophile-muted bg-audiophile-base/80 px-2 py-0.5 rounded backdrop-blur border border-audiophile-border/50 block truncate">
              {album}
            </span>
          </div>
        </div>

        {/* Título & Artista */}
        <div className="text-center w-full px-2">
          <h3 className="font-bold text-sm text-white truncate" title={title}>
            {title}
          </h3>
          <p className="text-audiophile-muted text-xs truncate mt-0.5" title={artist}>
            {artist}
          </p>
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
              <Cpu size={10} className="text-audiophile-cyan" /> Bitrate Promedio
            </span>
            <span className="font-bold text-audiophile-cyan mt-1">
              {bitrate > 0 ? `${bitrate} kbps` : "---"}
            </span>
          </div>

          <div className="bg-audiophile-surface2 border border-audiophile-border/70 rounded p-2 flex flex-col justify-between">
            <span className="text-audiophile-muted uppercase text-[9px] flex items-center gap-1">
              <Layers size={10} className="text-audiophile-green" /> Resolución PCM
            </span>
            <span className="font-bold text-audiophile-text mt-1">
              {sampleRate > 0 ? `${sampleRate / 1000} kHz / ${bitDepth}b` : "---"}
            </span>
          </div>

          <div className="bg-audiophile-surface2 border border-audiophile-border/70 rounded p-2 flex flex-col justify-between">
            <span className="text-audiophile-muted uppercase text-[9px]">Config Canales</span>
            <span className="font-bold text-audiophile-text mt-1">{channels}</span>
          </div>
        </div>

        {/* Ubicación del Archivo */}
        {telemetry.filepath && (
          <div className="w-full bg-audiophile-base border border-audiophile-border rounded p-2 font-mono text-[9px] text-audiophile-muted break-all">
            <span className="text-audiophile-cyan block mb-0.5">// Archivo fuente:</span>
            {telemetry.filepath}
          </div>
        )}
      </div>
    </div>
  );
};
