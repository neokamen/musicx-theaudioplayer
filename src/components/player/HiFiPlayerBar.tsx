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
  ChevronUp,
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
    playbackSettings,
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
    // Magnetic snap around 100%
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
  const isXdssActive = audioSettings?.isXdssEnabled ?? false;
  const isXtsProActive = audioSettings?.isXtsProEnabled ?? false;
  const eqGains = audioSettings?.eqGains || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const maxVolumeLimit = audioSettings?.allowExtraVolumeBoost ? 1.25 : 1.0;
  const volumePercentage = Math.round(volume * 100);
  const isBoosted = volumePercentage > 100;

  // Mini canvas waveform under seekbar
  useEffect(() => {
    const canvas = miniCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const spectrum = telemetry.spectrum && telemetry.spectrum.length > 0
        ? telemetry.spectrum
        : [];

      const barsCount = 32;
      const barWidth = w / barsCount;

      ctx.fillStyle = appearance.accentColor || "#06b6d4";
      ctx.globalAlpha = isPlaying && volume > 0 ? 0.45 : 0.08;

      for (let i = 0; i < barsCount; i++) {
        let val = 0;
        if (isPlaying && volume > 0 && spectrum.length > 0) {
          const specIdx = Math.floor((i / barsCount) * spectrum.length);
          val = (spectrum[specIdx] || 0) * (volume > 1 ? 1 : volume);
        }
        const barHeight = Math.max(1, val * h * 0.85);
        ctx.fillRect(i * barWidth + 1, h - barHeight, barWidth - 1, barHeight);
      }
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [telemetry.spectrum, isPlaying, volume, appearance.accentColor]);

  const freqs = ["31", "62", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];

  return (
    <footer className="h-20 border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-40 select-none shrink-0 relative">
      {/* 1. Track Metadata & Cover Thumbnail */}
      <div className="flex items-center gap-3 w-1/4 min-w-[200px] overflow-hidden">
        <div
          className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 shadow-md flex items-center justify-center shrink-0 overflow-hidden relative"
          style={{
            borderColor: appearance.neonGlow ? `${appearance.accentColor}44` : undefined,
          }}
        >
          {currentCoverArt ? (
            <img src={currentCoverArt} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500">
              <span className="font-mono text-[9px] font-bold" style={{ color: appearance.accentColor }}>
                {format}
              </span>
            </div>
          )}
        </div>

        <div className="overflow-hidden flex-1">
          {/* Marquee Title for long song names */}
          <div className="overflow-hidden whitespace-nowrap relative">
            <div
              className={`font-bold text-xs text-white ${
                title.length > 25 ? "inline-block animate-marquee" : "truncate"
              }`}
              title={title}
            >
              {title}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5" title={artist}>
            {artist}
          </div>
        </div>
      </div>

      {/* 2. Central Player Controls & Seekbar with Mini Spectrum */}
      <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`p-1.5 rounded transition-colors ${
              shuffle ? "text-cyan-400" : "text-slate-500 hover:text-white"
            }`}
            style={{ color: shuffle ? appearance.accentColor : undefined }}
            title={`Aleatorio: ${shuffle ? "Activado" : "Desactivado"}`}
          >
            <Shuffle size={14} />
          </button>

          <button
            onClick={previousTrack}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
            title="Anterior"
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={togglePlayPause}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-950 shadow-lg hover:scale-105 active:scale-95 transition-all font-bold"
            style={{
              backgroundColor: appearance.accentColor || "#06b6d4",
              boxShadow: appearance.neonGlow
                ? `0 0 15px ${appearance.accentColor}66`
                : "0 4px 12px rgba(0,0,0,0.4)",
            }}
            title={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors"
            title="Siguiente"
          >
            <SkipForward size={16} />
          </button>

          <button
            onClick={cycleRepeat}
            className={`p-1.5 rounded transition-colors ${
              repeat !== "off" ? "text-cyan-400" : "text-slate-500 hover:text-white"
            }`}
            style={{ color: repeat !== "off" ? appearance.accentColor : undefined }}
            title={`Repetir: ${repeat}`}
          >
            {repeat === "one" ? <Repeat1 size={14} /> : <Repeat size={14} />}
          </button>
        </div>

        {/* Seekbar container (Classic, Spectrum o Híbrido) */}
        <div className="w-full flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <span className="w-10 text-right">{formatTime(currentTime)}</span>

          <div className="flex-1 relative flex flex-col justify-center group h-6">
            {/* Mini Spectrum Canvas under seekbar (en modo hybrid o spectrum) */}
            {playbackSettings?.playerBarStyle !== "classic" && (
              <canvas
                ref={miniCanvasRef}
                width={360}
                height={playbackSettings?.playerBarStyle === "spectrum" ? 22 : 16}
                className={`absolute inset-0 w-full h-full pointer-events-none rounded ${
                  playbackSettings?.playerBarStyle === "spectrum" ? "opacity-95" : "opacity-75"
                }`}
              />
            )}

            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              disabled={duration === 0}
              className={`w-full bg-slate-800/80 rounded-lg appearance-none cursor-pointer accent-cyan-400 relative z-10 transition-all ${
                playbackSettings?.playerBarStyle === "spectrum"
                  ? "h-3 opacity-40 hover:opacity-70 group-hover:h-3.5"
                  : "h-1 group-hover:h-1.5"
              }`}
              style={{
                accentColor: appearance.accentColor || "#06b6d4",
              }}
            />
          </div>

          <span className="w-10 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. DSP Controls, Stereo/Mono Indicator, Audio Device & Volume Slider */}
      <div className="flex items-center justify-end gap-3 w-1/3 min-w-[320px]">
        {/* Fine STEREO / MONO Indicator */}
        <div className="flex items-center gap-1 font-mono text-[10px] tracking-wider px-2 py-1 rounded bg-slate-900 border border-slate-800">
          <span
            className={`transition-colors font-bold ${
              !isMono ? "text-cyan-400" : "text-slate-600"
            }`}
            style={{ color: !isMono ? appearance.accentColor : undefined }}
          >
            STEREO
          </span>
          <span className="text-slate-700">|</span>
          <span
            className={`transition-colors font-bold ${
              isMono ? "text-cyan-400" : "text-slate-600"
            }`}
            style={{ color: isMono ? appearance.accentColor : undefined }}
          >
            MONO
          </span>
        </div>

        {/* EQ Button with '+' popup */}
        <div className="relative">
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
            <button
              onClick={() => setAudioSettings({ isEqEnabled: !isEqActive })}
              className={`px-2 py-1 font-mono text-[10px] font-bold transition ${
                isEqActive
                  ? "bg-cyan-950/60 text-cyan-300"
                  : "text-slate-400 hover:text-white"
              }`}
              style={{
                color: isEqActive ? appearance.accentColor : undefined,
                boxShadow: isEqActive && appearance.neonGlow ? `0 0 10px ${appearance.accentColor}33` : undefined,
              }}
              title="Activar / Desactivar EQ"
            >
              EQ
            </button>
            <button
              onClick={() => {
                setIsEqPopupOpen(!isEqPopupOpen);
                setIsNormPopupOpen(false);
                setIsDeviceMenuOpen(false);
              }}
              className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 border-l border-slate-800 text-xs font-bold"
              title="Abrir ecualizador emergente"
            >
              +
            </button>
          </div>

          {/* EQ Popup Panel */}
          {isEqPopupOpen && (
            <div className="absolute bottom-12 right-0 w-80 p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl z-50 animate-fadeIn font-mono">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Sliders size={13} style={{ color: appearance.accentColor }} />
                  Ecualizador Hi-Fi (10 Bandas)
                </span>
                <button
                  onClick={() => setIsEqPopupOpen(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-between items-center gap-1 h-32 py-1">
                {freqs.map((freq, idx) => {
                  const gain = eqGains[idx] || 0;
                  return (
                    <div key={freq} className="flex-1 flex flex-col items-center justify-between h-full">
                      <span className="text-[8px] text-slate-400">
                        {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}
                      </span>
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="0.5"
                        value={gain}
                        onChange={(e) => {
                          const next = [...eqGains];
                          next[idx] = parseFloat(e.target.value);
                          setAudioSettings({ eqGains: next, isEqEnabled: true });
                        }}
                        className="h-20 w-1.5 appearance-none bg-slate-800 rounded cursor-pointer"
                        style={{
                          writingMode: "vertical-lr",
                          direction: "rtl",
                          accentColor: appearance.accentColor || "#06b6d4",
                        }}
                      />
                      <span className="text-[8px] text-slate-400 font-bold">{freq}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800 flex flex-col gap-2 text-[10px]">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setAudioSettings({ isXdssEnabled: !isXdssActive, isXtsProEnabled: false })}
                      className={`px-2 py-0.5 rounded font-bold border transition ${
                        isXdssActive
                          ? "border-amber-500 bg-amber-950/60 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                          : "border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                      title="LG XDSS Plus: Realce dinámico extremo de graves y agudos"
                    >
                      ⚡ XDSS Plus
                    </button>
                    <button
                      onClick={() => setAudioSettings({ isXtsProEnabled: !isXtsProActive, isXdssEnabled: false })}
                      className={`px-2 py-0.5 rounded font-bold border transition ${
                        isXtsProActive
                          ? "border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                          : "border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                      title="LG XTS Pro: Excelente sonido puro, balance espectral y anti-distorsión"
                    >
                      ✨ XTS Pro
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setAudioSettings({ eqGains: [4, 3, 2, 0, 0, 0, 1, 2, 3, 3], isEqEnabled: true })}
                      className="text-slate-400 hover:text-cyan-300 transition text-[9px]"
                      title="Preset Rock"
                    >
                      Rock
                    </button>
                    <button
                      onClick={() => setAudioSettings({ eqGains: [5, 4, 3, 1, 0, 0, 0, 0, 1, 1], isEqEnabled: true })}
                      className="text-slate-400 hover:text-cyan-300 transition text-[9px]"
                      title="Preset Bass"
                    >
                      Bass
                    </button>
                    <button
                      onClick={() => setAudioSettings({ eqGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] })}
                      className="text-slate-400 hover:text-white underline text-[9px]"
                    >
                      0dB
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* NORM Button with '+' popup */}
        <div className="relative">
          <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
            <button
              onClick={() => setAudioSettings({ isNormalizerEnabled: !isNormActive })}
              className={`px-2 py-1 font-mono text-[10px] font-bold transition ${
                isNormActive
                  ? "bg-emerald-950/60 text-emerald-300"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Activar / Desactivar Normalizador Soundix"
            >
              NORM
            </button>
            <button
              onClick={() => {
                setIsNormPopupOpen(!isNormPopupOpen);
                setIsEqPopupOpen(false);
                setIsDeviceMenuOpen(false);
              }}
              className="px-1.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 border-l border-slate-800 text-xs font-bold"
              title="Ajustes de normalización"
            >
              +
            </button>
          </div>

          {/* Normalizer Popup */}
          {isNormPopupOpen && (
            <div className="absolute bottom-12 right-0 w-64 p-3 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl z-50 animate-fadeIn font-mono">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  Soundix Normalizer
                </span>
                <button
                  onClick={() => setIsNormPopupOpen(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Limiter Activo:</span>
                  <span className={isNormActive ? "text-emerald-400 font-bold" : "text-slate-500"}>
                    {isNormActive ? "ON (-0.1 dB True-Peak)" : "OFF"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ReplayGain Target:</span>
                  <span className="text-cyan-400 font-bold">-14.0 LUFS</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audio Output Device Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsDeviceMenuOpen(!isDeviceMenuOpen);
              setIsEqPopupOpen(false);
              setIsNormPopupOpen(false);
            }}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition flex items-center gap-1.5"
            title={`Dispositivo: ${selectedDevice}`}
          >
            <Speaker size={14} style={{ color: appearance.accentColor }} />
            <ChevronUp size={10} className="text-slate-500" />
          </button>

          {isDeviceMenuOpen && (
            <div className="absolute bottom-12 right-0 w-64 p-2 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl z-50 font-mono text-xs animate-fadeIn">
              <div className="p-2 text-[10px] uppercase text-slate-400 border-b border-slate-800 font-bold">
                Dispositivos de Salida
              </div>
              <div className="max-h-48 overflow-y-auto py-1 space-y-1">
                {availableDevices.map((dev) => (
                  <button
                    key={dev}
                    onClick={() => {
                      setOutputDevice(dev);
                      setIsDeviceMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] truncate transition ${
                      selectedDevice === dev
                        ? "bg-cyan-950/60 text-cyan-300 font-bold border border-cyan-800/60"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {dev}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Volume Slider with Boost up to 125% and lowercase percentage indicator */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <div className="flex flex-col items-center">
            <input
              type="range"
              min={0}
              max={maxVolumeLimit}
              step={0.01}
              value={volume}
              onChange={handleVolume}
              className={`w-20 h-1 rounded-lg appearance-none cursor-pointer transition-all ${
                isBoosted ? "bg-rose-950" : "bg-slate-800"
              }`}
              style={{
                accentColor: isBoosted ? "#ef4444" : (appearance.accentColor || "#06b6d4"),
              }}
              title={`Volumen: ${volumePercentage}%`}
            />

            {/* Lowercase percentage in accent color, turning red if > 100% */}
            <span
              className={`text-[9px] font-mono font-bold mt-0.5 transition-colors ${
                isBoosted ? "text-rose-500 animate-pulse" : ""
              }`}
              style={{
                color: isBoosted ? "#ef4444" : (appearance.accentColor || "#06b6d4"),
              }}
            >
              {volumePercentage}%
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
