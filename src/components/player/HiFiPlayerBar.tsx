import React, { useState, useRef, useEffect } from "react";
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
  Speaker,
  Sliders,
  Sparkles,
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
    audioSettings,
    availableDevices,
    selectedDevice,
    appearance,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    setOutputDevice,
    toggleShuffle,
    cycleRepeat,
    setAudioSettings,
  } = useMusicStore();

  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);
  const [isEqPopupOpen, setIsEqPopupOpen] = useState(false);
  const [isNormPopupOpen, setIsNormPopupOpen] = useState(false);

  const miniCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentTime = telemetry.current_time || 0;
  const duration = telemetry.duration || currentTrack?.duration_seconds || 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (val > 0.97 && val < 1.03) {
      val = 1.0;
    }
    setVolume(val);
  };

  const title = telemetry.track_title || currentTrack?.title || "musicx Hi-Fi Player";
  const artist = telemetry.track_artist || currentTrack?.artist || "Listo para reproducir";
  const format = currentTrack?.format || (telemetry.filepath ? telemetry.filepath.split(".").pop()?.toUpperCase() : "PCM");

  const channels = telemetry.channels || 2;
  const isMono = channels === 1;

  const isEqActive = audioSettings?.isEqEnabled ?? false;
  const isNormActive = audioSettings?.isNormalizerEnabled ?? false;
  const eqGains = audioSettings?.eqGains || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const maxVolumeLimit = audioSettings?.allowExtraVolumeBoost ? 1.25 : 1.0;
  const volPercent = Math.round(volume * 100);

  // Mini canvas spectrum underneath seek bar
  useEffect(() => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const accent = appearance.accentColor || "#06b6d4";

    const renderMini = () => {
      animId = requestAnimationFrame(renderMini);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (!isPlaying || telemetry.state !== "Playing" || volume === 0) return;

      const bands = telemetry.spectrum && telemetry.spectrum.length > 0 ? telemetry.spectrum : [];
      const count = 32;
      const barW = w / count;

      for (let i = 0; i < count; i++) {
        const bandVal = bands[i % bands.length] || 0;
        const barH = bandVal * h * 0.9;
        ctx.fillStyle = accent;
        ctx.fillRect(i * barW, h - barH, barW - 1, barH);
      }
    };

    animId = requestAnimationFrame(renderMini);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, volume, telemetry.spectrum, appearance.accentColor]);

  return (
    <footer className="h-24 border-t border-audiophile-border bg-audiophile-surface px-4 flex items-center justify-between gap-4 font-sans select-none z-40 shrink-0 relative">
      {/* 1. Track Info con Carátula & Título con Scroll Marquee */}
      <div className="flex items-center gap-3 w-1/4 min-w-[230px] overflow-hidden">
        {currentCoverArt ? (
          <img
            src={currentCoverArt}
            alt="Cover"
            className="w-13 h-13 rounded-lg object-cover border border-audiophile-border shrink-0 shadow-md"
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

        <div className="overflow-hidden flex-1 group">
          <div className="font-semibold text-xs text-white whitespace-nowrap overflow-hidden text-ellipsis group-hover:animate-marquee">
            <span>{title}</span>
          </div>
          <div className="text-[11px] text-audiophile-muted truncate mt-0.5" title={artist}>
            {artist}
          </div>
        </div>
      </div>

      {/* 2. Controles de Transporte, Barra de Seek & Espectro Fino Adaptado */}
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

        {/* Barra de seek y Espectro Fino */}
        <div className="w-full flex flex-col gap-0.5">
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

          {/* Mini Espectro de la Canción fino con acento */}
          <div className="w-full h-2 px-12 overflow-hidden opacity-80">
            <canvas ref={miniCanvasRef} width={400} height={10} className="w-full h-full block" />
          </div>
        </div>
      </div>

      {/* 3. Bloque de Salida, DSP (EQ, NORM), Stereo/Mono & Volumen con Boost */}
      <div className="flex items-center justify-end gap-3 w-1/3 min-w-[340px]">
        {/* Indicador STEREO / MONO con iluminación fina */}
        <div className="flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-audiophile-base border border-audiophile-border/80">
          <span className={`font-bold transition-colors ${!isMono ? "text-audiophile-cyan shadow-sm shadow-audiophile-cyan/50" : "text-audiophile-muted/40"}`}>
            STEREO
          </span>
          <span className="text-audiophile-muted/30">/</span>
          <span className={`font-bold transition-colors ${isMono ? "text-amber-400 shadow-sm shadow-amber-400/50" : "text-audiophile-muted/40"}`}>
            MONO
          </span>
        </div>

        {/* Botón EQ con popup */}
        <div className="relative">
          <div className="flex items-center bg-audiophile-base border border-audiophile-border rounded">
            <button
              onClick={() => setAudioSettings({ isEqEnabled: !isEqActive })}
              className={`px-2 py-1 text-[10px] font-mono font-bold transition-all ${
                isEqActive
                  ? "text-audiophile-cyan shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  : "text-audiophile-muted hover:text-white"
              }`}
              title="Activar/Desactivar Ecualizador"
            >
              EQ
            </button>
            <button
              onClick={() => setIsEqPopupOpen(!isEqPopupOpen)}
              className="px-1 py-1 text-[9px] text-audiophile-muted hover:text-audiophile-cyan border-l border-audiophile-border"
              title="Abrir panel de Ecualizador"
            >
              +
            </button>
          </div>

          {/* Popup Ecualizador Rápido */}
          {isEqPopupOpen && (
            <div className="absolute bottom-12 right-0 w-80 p-3 rounded-xl bg-slate-950/95 border border-cyan-500/50 shadow-2xl z-50 animate-fadeIn font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5 text-[11px]">
                  <Sliders size={12} /> Ecualizador Rápido (10 Bandas)
                </span>
                <button
                  onClick={() => setIsEqPopupOpen(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 py-1">
                {eqGains.slice(0, 5).map((gain, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] text-slate-400">{i === 0 ? "31Hz" : i === 1 ? "125Hz" : i === 2 ? "500Hz" : i === 3 ? "2kHz" : "8kHz"}</span>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      value={gain}
                      onChange={(e) => {
                        const next = [...eqGains];
                        next[i] = Number(e.target.value);
                        setAudioSettings({ eqGains: next });
                      }}
                      className="w-12 h-1 accent-cyan-400"
                    />
                    <span className="text-[8px] text-cyan-300">{gain}dB</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botón Normalizador con popup */}
        <div className="relative">
          <div className="flex items-center bg-audiophile-base border border-audiophile-border rounded">
            <button
              onClick={() => setAudioSettings({ isNormalizerEnabled: !isNormActive })}
              className={`px-2 py-1 text-[10px] font-mono font-bold transition-all ${
                isNormActive
                  ? "text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                  : "text-audiophile-muted hover:text-white"
              }`}
              title="Normalizador de Picos"
            >
              NORM
            </button>
            <button
              onClick={() => setIsNormPopupOpen(!isNormPopupOpen)}
              className="px-1 py-1 text-[9px] text-audiophile-muted hover:text-emerald-400 border-l border-audiophile-border"
              title="Ajustes de Normalizador"
            >
              +
            </button>
          </div>

          {/* Popup Normalizador */}
          {isNormPopupOpen && (
            <div className="absolute bottom-12 right-0 w-64 p-3 rounded-xl bg-slate-950/95 border border-emerald-500/50 shadow-2xl z-50 animate-fadeIn font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                  <Sparkles size={12} /> Normalizador Soundix
                </span>
                <button
                  onClick={() => setIsNormPopupOpen(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Peak Limiter (-0.5 dBFS)</span>
                  <span className="text-emerald-400 font-bold">ACTIVO</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">ReplayGain / EBU R128</span>
                  <span className="text-emerald-400 font-bold">AUTO</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selector de Dispositivo de Audio en Barra Inferior */}
        <div className="relative">
          <button
            onClick={() => setIsDeviceMenuOpen(!isDeviceMenuOpen)}
            className="p-1.5 rounded bg-audiophile-base border border-audiophile-border hover:border-audiophile-cyan text-audiophile-text hover:text-audiophile-cyan transition-colors"
            title="Seleccionar Dispositivo de Salida"
          >
            <Speaker size={14} />
          </button>

          {isDeviceMenuOpen && (
            <div className="absolute bottom-12 right-0 w-64 p-2 rounded-xl bg-slate-950/95 border border-slate-700 shadow-2xl z-50 animate-fadeIn font-mono text-xs space-y-1">
              <div className="text-[10px] text-slate-400 uppercase px-2 py-1 border-b border-slate-800">
                Dispositivos de Audio
              </div>
              {availableDevices.map((dev) => (
                <button
                  key={dev}
                  onClick={() => {
                    setOutputDevice(dev);
                    setIsDeviceMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-[11px] truncate transition-colors ${
                    selectedDevice === dev
                      ? "bg-cyan-950/50 text-cyan-300 border border-cyan-500/40 font-bold"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {dev}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Control de volumen con Boost hasta 125% y texto de porcentaje en minúsculas */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
            className="text-audiophile-muted hover:text-white transition-colors"
          >
            {volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          <div className="flex flex-col items-center">
            <input
              type="range"
              min={0}
              max={maxVolumeLimit}
              step={0.01}
              value={volume}
              onChange={handleVolume}
              className={`w-18 h-1 rounded-lg appearance-none cursor-pointer ${
                volPercent > 100 ? "accent-red-500 bg-red-950" : "accent-audiophile-cyan bg-audiophile-border"
              }`}
              title={`Volumen: ${volPercent}%`}
            />
            {/* Porcentaje en minúsculas con acento / rojo si pasa de 100 */}
            <span
              className={`text-[8px] font-mono lowercase tracking-tight -mt-0.5 ${
                volPercent > 100 ? "text-red-500 font-bold animate-pulse" : "text-audiophile-cyan font-semibold"
              }`}
            >
              {volPercent}%
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
