import React from "react";
import { useMusicStore } from "../../store/index.ts";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Repeat,
  Repeat1,
  Cpu,
  Settings,
} from "lucide-react";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const HiFiPlayerBar: React.FC = () => {
  const {
    isPlaying,
    volume,
    currentTrack,
    telemetry,
    currentCoverArt,
    shuffle,
    repeat,
    bitPerfectMode,
    setSettingsOpen,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    toggleShuffle,
    cycleRepeat,
  } = useMusicStore();

  const currentTime = telemetry.current_time || 0;
  const duration = telemetry.duration || currentTrack?.duration_seconds || 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  const title = telemetry.track_title || currentTrack?.title || "musicx Hi-Fi Player";
  const artist = telemetry.track_artist || currentTrack?.artist || "Listo para reproducir";

  // Formato del códec
  const format = currentTrack?.format || (telemetry.filepath ? telemetry.filepath.split(".").pop()?.toUpperCase() : "PCM");

  // Telemetría DAC
  const isBitPerfect = bitPerfectMode || telemetry.is_bit_perfect;
  const sampleRateKhz = telemetry.sample_rate ? (telemetry.sample_rate / 1000).toFixed(1) : "44.1";
  const bitDepth = telemetry.bits_per_sample ? `${telemetry.bits_per_sample}-bit` : "16-bit";
  const bitrate = telemetry.bitrate || currentTrack?.bitrate_kbps || 1411;

  // Driver de salida
  const isAlsaDirect = telemetry.output_device.toLowerCase().includes("hw:") || isBitPerfect;
  const driverLabel = isAlsaDirect ? "ALSA: Bit-Perfect" : telemetry.output_device.includes("Default") ? "PipeWire / Shared" : telemetry.output_device;

  return (
    <footer className="h-20 border-t border-audiophile-border bg-audiophile-surface px-4 flex items-center justify-between gap-4 font-sans select-none z-40 shrink-0">
      {/* 1. Track Info con Carátula / Badge de Códec */}
      <div className="flex items-center gap-3 w-1/4 min-w-[220px] overflow-hidden">
        {currentCoverArt ? (
          <img
            src={currentCoverArt}
            alt="Track Cover"
            className="w-12 h-12 rounded-lg object-cover border border-audiophile-border shrink-0 shadow-md"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-audiophile-base border border-audiophile-border flex flex-col items-center justify-center shrink-0 shadow-inner">
            <span className="font-mono text-[11px] font-black text-audiophile-cyan tracking-wider">
              {format}
            </span>
            <span className="font-mono text-[8px] text-audiophile-muted uppercase">
              Hi-Res
            </span>
          </div>
        )}

        <div className="truncate">
          <div className="font-semibold text-xs text-white truncate flex items-center gap-1.5" title={title}>
            <span>{title}</span>
          </div>
          <div className="text-[11px] text-audiophile-muted truncate mt-0.5" title={artist}>
            {artist}
          </div>
        </div>
      </div>

      {/* 2. Controles de Transporte y Barra de Seek Precisa */}
      <div className="flex-1 max-w-xl flex flex-col items-center gap-1">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded transition-colors ${
              shuffle ? "text-audiophile-cyan" : "text-audiophile-muted hover:text-white"
            }`}
            title={`Aleatorio: ${shuffle ? "Activado" : "Desactivado"}`}
          >
            <Shuffle size={14} />
          </button>

          <button
            onClick={previousTrack}
            className="p-1.5 rounded hover:bg-audiophile-surface2 text-audiophile-text transition-colors"
            title="Anterior"
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-9 h-9 rounded-full bg-audiophile-cyan text-audiophile-base flex items-center justify-center shadow-lg shadow-audiophile-cyan/20 hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <Pause size={17} fill="currentColor" />
            ) : (
              <Play size={17} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 rounded hover:bg-audiophile-surface2 text-audiophile-text transition-colors"
            title="Siguiente"
          >
            <SkipForward size={16} />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-1.5 rounded transition-colors ${
              repeat !== "off" ? "text-audiophile-cyan" : "text-audiophile-muted hover:text-white"
            }`}
            title={`Repetir: ${repeat}`}
          >
            {repeat === "one" ? <Repeat1 size={14} /> : <Repeat size={14} />}
          </button>
        </div>

        {/* Barra de seek con precisión milimétrica */}
        <div className="w-full flex items-center gap-2 font-mono text-[10px] text-audiophile-muted">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 relative flex items-center group">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              disabled={duration === 0}
              className="w-full h-1 bg-audiophile-border rounded-lg appearance-none cursor-pointer accent-audiophile-cyan group-hover:h-1.5 transition-all"
            />
          </div>
          <span className="w-10 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Bloque de Telemetría Hi-Fi estilo Rack & Controles de Salida */}
      <div className="flex items-center justify-end gap-4 w-1/3 min-w-[300px]">
        {/* Rack Hi-Fi Digital Display */}
        <div className="bg-audiophile-base border border-audiophile-border/90 rounded-lg px-3 py-1.5 font-mono flex items-center gap-3 shadow-inner">
          {/* Frecuencia y Bits Reales */}
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-audiophile-cyan tracking-wider">
              {sampleRateKhz} kHz
            </span>
            <span className="text-[9px] text-audiophile-amber">
              {bitDepth}
            </span>
          </div>

          <div className="w-[1px] h-7 bg-audiophile-border/80" />

          {/* Bitrate numérico en tiempo real */}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-audiophile-text flex items-center gap-1">
              <Cpu size={10} className="text-audiophile-cyan" />
              {bitrate > 0 ? `${bitrate} kbps` : "1411 kbps"}
            </span>
            {/* Indicador LED de modo de salida */}
            <span className="text-[9px] flex items-center gap-1.5 mt-0.5 truncate max-w-[120px]">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isBitPerfect
                    ? "bg-audiophile-green shadow-sm shadow-audiophile-green/80 animate-pulse"
                    : "bg-audiophile-amber"
                }`}
              />
              <span className={isBitPerfect ? "text-audiophile-green font-bold" : "text-audiophile-muted"} title={driverLabel}>
                {driverLabel}
              </span>
            </span>
          </div>
        </div>

        {/* Control de volumen & Botón de Ajustes */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setVolume(volume > 0 ? 0 : 1)}
              className="text-audiophile-muted hover:text-white transition-colors"
            >
              {volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              type="range"
              min={0}
              max={1.5}
              step={0.01}
              value={volume}
              onChange={handleVolume}
              className="w-16 h-1 bg-audiophile-border rounded-lg appearance-none cursor-pointer accent-audiophile-cyan"
              title={`Volumen: ${(volume * 100).toFixed(0)}%`}
            />
          </div>

          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 transition-all shadow-sm"
            title="Ajustes de musicx"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};
;
