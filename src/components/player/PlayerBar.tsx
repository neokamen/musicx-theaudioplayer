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
  ShieldCheck,
} from "lucide-react";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const PlayerBar: React.FC = () => {
  const {
    isPlaying,
    volume,
    currentTrack,
    telemetry,
    shuffle,
    repeat,
    bitPerfectMode,
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

  return (
    <footer className="h-16 border-t border-audiophile-border bg-audiophile-surface px-4 flex items-center justify-between gap-4 font-sans select-none z-40">
      {/* Información de la pista actual */}
      <div className="flex items-center gap-3 w-1/4 min-w-[200px] overflow-hidden">
        <div className="w-10 h-10 rounded bg-audiophile-surface2 border border-audiophile-border flex items-center justify-center shrink-0">
          <span className="font-mono text-[10px] font-bold text-audiophile-cyan">
            {currentTrack?.format || "PCM"}
          </span>
        </div>
        <div className="truncate">
          <div className="font-semibold text-xs text-white truncate" title={title}>
            {title}
          </div>
          <div className="text-[11px] text-audiophile-muted truncate" title={artist}>
            {artist}
          </div>
        </div>
      </div>

      {/* Controles centrales de Transporte y Barra de Progreso */}
      <div className="flex-1 max-w-2xl flex flex-col items-center gap-1">
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
            className="w-8 h-8 rounded-full bg-audiophile-cyan text-audiophile-base flex items-center justify-center shadow hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
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

        {/* Barra de progreso de la pista */}
        <div className="w-full flex items-center gap-2 font-mono text-[10px] text-audiophile-muted">
          <span className="w-9 text-right">{formatTime(currentTime)}</span>
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
          <span className="w-9 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control de volumen & Estado Bit-Perfect */}
      <div className="flex items-center justify-end gap-3 w-1/4 min-w-[180px]">
        {bitPerfectMode && (
          <div className="flex items-center gap-1 font-mono text-[10px] text-audiophile-green bg-audiophile-green/10 border border-audiophile-green/30 px-2 py-0.5 rounded">
            <ShieldCheck size={11} />
            <span>BIT-PERFECT</span>
          </div>
        )}

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
            className="w-20 h-1 bg-audiophile-border rounded-lg appearance-none cursor-pointer accent-audiophile-cyan"
            title={`Volumen: ${(volume * 100).toFixed(0)}%`}
          />
          <span className="font-mono text-[10px] text-audiophile-muted w-7 text-right">
            {(volume * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </footer>
  );
};
