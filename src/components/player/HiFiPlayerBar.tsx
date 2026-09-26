import React, { useState, useRef, useEffect, useMemo } from "react";
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
  Flame,
  Layers,
  Sparkles,
} from "lucide-react";

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

interface HiFiPlayerBarProps {
  height: number;
  isEditing: boolean;
  onHeightChange: (height: number) => void;
}

export const HiFiPlayerBar: React.FC<HiFiPlayerBarProps> = ({ height, isEditing, onHeightChange }) => {
  const {
    isPlaying,
    volume,
    currentTrack,
    telemetry,
    currentCoverArt,
    shuffle,
    repeat,
    audioSettings,
    playbackSettings,
    bitPerfectMode,
    availableDevices,
    selectedDevice,
    appearance,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seek,
    setVolume,
    setOutputDevice,
    setBitPerfectMode,
    toggleShuffle,
    cycleRepeat,
    setAudioSettings,
    setPlaybackSettings,
  } = useMusicStore();

  const [isDeviceMenuOpen, setIsDeviceMenuOpen] = useState(false);
  const [isEqPopupOpen, setIsEqPopupOpen] = useState(false);
  const [isHoveredTitle, setIsHoveredTitle] = useState(false);
  const [bitPerfectPulse, setBitPerfectPulse] = useState(false);
  const [isPlayFlipping, setIsPlayFlipping] = useState(false);
  const resizeStart = useRef<{ x: number; y: number; height: number; width: number } | null>(null);

  const currentTime = telemetry.current_time || 0;
  const duration = telemetry.duration || currentTrack?.duration_seconds || 0;

  const scrubberRef = useRef<HTMLDivElement | null>(null);
  const [isDraggingSeek, setIsDraggingSeek] = useState(false);

  const title = telemetry.track_title || currentTrack?.title || "musicx Hi-Fi Player";
  const artist = telemetry.track_artist || currentTrack?.artist || "Listo para reproducir";
  const format =
    currentTrack?.format ||
    (telemetry.filepath ? telemetry.filepath.split(".").pop()?.toUpperCase() : "PCM");

  const channels = telemetry.channels || 2;
  const isMono = channels === 1;

  const isEqActive = audioSettings?.isEqEnabled ?? false;
  const isNormActive = audioSettings?.isNormalizerEnabled ?? false;
  const isXdssActive = audioSettings?.isXdssEnabled ?? false;
  const isXtsProActive = audioSettings?.isXtsProEnabled ?? false;
  const eqGains = audioSettings?.eqGains || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const maxVolumeLimit = audioSettings?.allowExtraVolumeBoost ? 1.35 : 1.0;
  const volumePercentage = Math.round(volume * 100);
  const isBoosted = volumePercentage > 100;
  const accentColor = appearance.accentColor || "#06b6d4";

  const currentBpm = playbackSettings?.bpmValue || 128;
  const beatPeriod = 60 / currentBpm;

  const TOTAL_BARS = 96;
  const songPeaks = useMemo(() => {
    const seed = (currentTrack?.filepath || title).split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const result: number[] = [];
    for (let i = 0; i < TOTAL_BARS; i++) {
      const v = Math.abs(
        Math.sin(i * 0.18 + seed * 0.05) * 0.55 +
        Math.cos(i * 0.07 + seed * 0.02) * 0.35 +
        Math.sin(i * 0.37) * 0.1 +
        0.12
      );
      result.push(Math.max(0.12, Math.min(1.0, v)));
    }
    return result;
  }, [currentTrack?.filepath, title]);

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const activeBarIdx = Math.floor(progress * TOTAL_BARS);
  const liveSpectrum = telemetry.spectrum || [];
  const waveformSamples = Array.from({ length: 65 }, (_, index) => {
    const sourceIndex = liveSpectrum.length
      ? Math.min(liveSpectrum.length - 1, Math.floor(index / 64 * liveSpectrum.length))
      : -1;
    const band = sourceIndex >= 0 ? Math.max(0, Math.min(1, liveSpectrum[sourceIndex] || 0)) : 0.08;
    const phase = index * 0.34 + currentTime * 9;
    const amplitude = Math.max(2, Math.min(42, band * 54));
    const wave = Math.sin(phase) * amplitude;
    return { x: (index / 64) * 1000, upper: 50 + wave, lower: 50 - wave };
  });
  const smoothPath = (points: { x: number; y: number }[]) => {
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let index = 1; index < points.length; index++) {
      const previous = points[index - 1];
      const current = points[index];
      const midX = (previous.x + current.x) / 2;
      const midY = (previous.y + current.y) / 2;
      path += ` Q ${previous.x} ${previous.y} ${midX} ${midY}`;
    }
    const last = points[points.length - 1];
    return `${path} T ${last.x} ${last.y}`;
  };
  const upperWave = smoothPath(waveformSamples.map(({ x, upper }) => ({ x, y: upper })));
  const lowerWave = smoothPath(waveformSamples.map(({ x, lower }) => ({ x, y: lower })).reverse());
  const waveformPath = `${upperWave} L 1000 50 ${lowerWave.replace(/^M [^ ]+ [^ ]+/, "L 1000 50")} Z`;

  const handlePointerSeek = (clientX: number) => {
    if (!scrubberRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    seek(pct * duration);
  };

  const handleMouseDownSeek = (e: React.MouseEvent) => {
    setIsDraggingSeek(true);
    handlePointerSeek(e.clientX);
  };

  useEffect(() => {
    if (!isDraggingSeek) return;
    const onMove = (e: MouseEvent) => handlePointerSeek(e.clientX);
    const onUp = () => setIsDraggingSeek(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDraggingSeek, duration]);

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (val > 0.97 && val < 1.03) {
      val = 1.0;
    }
    setVolume(val);
  };

  const handleToggleBitPerfect = async () => {
    setBitPerfectPulse(true);
    await setBitPerfectMode(!bitPerfectMode);
    setTimeout(() => setBitPerfectPulse(false), 800);
  };

  const handlePlayClick = () => {
    setIsPlayFlipping(false);
    requestAnimationFrame(() => setIsPlayFlipping(true));
    window.setTimeout(() => setIsPlayFlipping(false), 700);
    void togglePlayPause();
  };

  const freqs = ["31", "62", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];
  const seekbarStyle = playbackSettings?.playerBarStyle || "spectrum";

  return (
    <footer style={{ height }} className="border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-40 select-none shrink-0 relative">
      {isEditing && <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Cambiar altura de la barra de reproducción"
        onPointerDown={(event) => {
          event.preventDefault();
          resizeStart.current = { x: event.clientX, y: event.clientY, height, width: playbackSettings?.playerBarWidth || 100 };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (resizeStart.current) onHeightChange(resizeStart.current.height + resizeStart.current.y - event.clientY);
        }}
        onPointerUp={() => { resizeStart.current = null; }}
        onPointerCancel={() => { resizeStart.current = null; }}
        className="absolute left-0 right-0 top-[-4px] z-50 h-2 cursor-row-resize touch-none group/player-resize"
        title="Arrastrar para cambiar la altura del reproductor"
      >
        <span className="absolute left-1/2 top-1/2 h-px w-16 -translate-x-1/2 -translate-y-1/2 bg-slate-600/70 group-hover/player-resize:bg-cyan-400 group-hover/player-resize:shadow-[0_0_8px_var(--app-accent)]" />
      </div>}
      {/* Left block: Cover, Track Info & Bit-Perfect Badge */}
      <div className="flex items-center gap-3 w-1/4 min-w-[220px] overflow-hidden">
        <div
          className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 shadow-md flex items-center justify-center shrink-0 overflow-hidden relative"
          style={{
            borderColor: appearance.neonGlow ? `${accentColor}44` : undefined,
          }}
        >
          {currentCoverArt ? (
            <img src={currentCoverArt} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500">
              <span className="font-mono text-[9px] font-bold" style={{ color: accentColor }}>
                {format}
              </span>
            </div>
          )}
        </div>

        <div className="overflow-hidden flex-1">
          <div
            className="overflow-hidden whitespace-nowrap relative cursor-default"
            onMouseEnter={() => setIsHoveredTitle(true)}
            onMouseLeave={() => setIsHoveredTitle(false)}
          >
            <div
              className={`font-bold text-xs text-white transition-transform duration-300 ${
                isHoveredTitle || title.length > 28
                  ? "inline-block animate-marquee"
                  : "truncate"
              }`}
              title={title}
            >
              {title}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5" title={artist}>
            {artist}
          </div>

          <div className="flex items-center gap-2 mt-1">
            {/* Pulsing BPM Badge */}
            {isPlaying && (
              <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[9px] font-mono font-bold"
                style={{ color: accentColor }}
                title="BPM fijo configurable en Ajustes"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: accentColor,
                    animation: playbackSettings?.bpmPulseEnabled ? `bpm-beat-glow ${beatPeriod}s ease-in-out infinite` : "none",
                  }}
                />
                  <span>{currentBpm} BPM</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center block: Controls & Symmetrical Adaptive Seekbar */}
      <div className="relative flex min-w-0 max-w-none flex-col items-center gap-1.5 px-2" style={{ width: `${playbackSettings?.playerBarWidth || 100}%`, flex: `0 1 ${playbackSettings?.playerBarWidth || 100}%` }}>
        {isEditing && <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Cambiar ancho de las barras de reproducción"
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            resizeStart.current = { x: event.clientX, y: event.clientY, height, width: playbackSettings?.playerBarWidth || 100 };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!resizeStart.current) return;
            const delta = ((event.clientX - resizeStart.current.x) / Math.max(1, window.innerWidth)) * 100;
            setPlaybackSettings({ playerBarWidth: Math.max(40, Math.min(100, resizeStart.current.width + delta)) });
          }}
          onPointerUp={() => { resizeStart.current = null; }}
          onPointerCancel={() => { resizeStart.current = null; }}
          className="absolute right-0 top-1/2 z-50 h-14 w-2 -translate-y-1/2 cursor-col-resize touch-none rounded bg-cyan-400/25 hover:bg-cyan-400/70"
          title="Arrastrar para redimensionar horizontalmente las tres barras"
        />}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleShuffle}
            className="p-1.5 rounded transition-colors"
            style={{ color: shuffle ? accentColor : "#94a3b8" }}
            title={`Aleatorio: ${shuffle ? "Activado" : "Desactivado"}`}
          >
            <Shuffle size={14} />
          </button>

          <button
            onClick={previousTrack}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Anterior"
          >
            <SkipBack size={16} />
          </button>

          <button
            onClick={handlePlayClick}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-slate-950 shadow-lg hover:scale-105 active:scale-95 transition-all font-bold cursor-pointer ${isPlaying && playbackSettings?.playButtonBpmPulseEnabled ? "animate-bpm-play-button" : ""}`}
            style={{
              backgroundColor: accentColor,
              boxShadow: appearance.neonGlow
                ? `0 0 15px ${accentColor}66`
                : "0 4px 12px rgba(0,0,0,0.4)",
              animationDuration: `${beatPeriod}s`,
              animationName: isPlaying && playbackSettings?.playButtonBpmPulseEnabled ? "bpm-play-button" : undefined,
            }}
            title={isPlaying ? "Pausar" : "Reproducir"}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" className={isPlayFlipping ? "animate-play-button-flip" : ""} />
            ) : (
              <Play size={18} fill="currentColor" className={`ml-0.5 ${isPlayFlipping ? "animate-play-button-flip" : ""}`} />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Siguiente"
          >
            <SkipForward size={16} />
          </button>

          <button
            onClick={cycleRepeat}
            className="p-1.5 rounded transition-colors"
            style={{ color: repeat !== "off" ? accentColor : "#94a3b8" }}
            title={`Repetir: ${repeat}`}
          >
            {repeat === "one" ? <Repeat1 size={14} /> : <Repeat size={14} />}
          </button>
        </div>

        <div className="w-full flex items-center gap-2 font-mono text-[10px] text-slate-400">
          <span className="w-10 text-right shrink-0">{formatTime(currentTime)}</span>

          <div
            ref={scrubberRef}
            onMouseDown={handleMouseDownSeek}
            className="flex-1 h-7 bg-slate-900/90 hover:bg-slate-900 border border-slate-800 rounded-lg px-2 flex items-center justify-between gap-[2px] cursor-pointer select-none relative overflow-hidden group shadow-inner transition-colors"
            title="Haz clic o arrastra para desplazarte"
          >
            {seekbarStyle === "spectrum" && (
              songPeaks.map((p, i) => {
                const isPassed = i <= activeBarIdx;
                const heightPct = Math.max(18, Math.floor(p * 90));
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-full transition-all duration-75"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: isPassed ? accentColor : "rgba(255, 255, 255, 0.14)",
                      boxShadow: isPassed ? `0 0 5px ${accentColor}60` : "none",
                    }}
                  />
                );
              })
            )}

            {seekbarStyle === "classic" && (
              <div className="w-full h-full flex items-center relative">
                <div className="w-full h-2 bg-slate-800 rounded-full relative overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-100"
                    style={{
                      width: `${progress * 100}%`,
                      backgroundColor: accentColor,
                      boxShadow: `0 0 8px ${accentColor}aa`,
                    }}
                  />
                </div>
              </div>
            )}

            {seekbarStyle === "hybrid" && (
              <div className="w-full h-full relative pointer-events-none">
                <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                  <defs>
                    <clipPath id="seek-wave-progress">
                      <rect x="0" y="0" width={progress * 1000} height="100" />
                    </clipPath>
                  </defs>
                  <path d={waveformPath} fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  <path d={waveformPath} fill={`${accentColor}28`} stroke={accentColor} strokeWidth="1.5" vectorEffect="non-scaling-stroke" clipPath="url(#seek-wave-progress)" />
                  <line x1="0" y1="50" x2="1000" y2="50" stroke="rgba(255,255,255,0.18)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
            )}
          </div>

          <span className="w-10 text-left shrink-0">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right block: Upper Row (EQ +, NORM, STEREO/MONO, Speaker Device) | Lower Row (Volume Slider) */}
      <div className="flex flex-col items-end justify-center gap-1.5 w-1/3 min-w-[320px]">
        {/* Upper Row: Controls */}
        <div className="flex items-center gap-2">
          {/* EQ + Button */}
          <div className="relative">
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 overflow-hidden">
              <button
                onClick={() => setAudioSettings({ isEqEnabled: !isEqActive })}
                className="px-2.5 py-1 font-mono text-[10px] font-bold transition cursor-pointer"
                style={{
                  color: isEqActive ? accentColor : "#94a3b8",
                  boxShadow: isEqActive && appearance.neonGlow ? `0 0 10px ${accentColor}33` : undefined,
                }}
                title="Activar / Desactivar EQ"
              >
                EQ
              </button>
              <button
                onClick={() => {
                  setIsEqPopupOpen(!isEqPopupOpen);
                  setIsDeviceMenuOpen(false);
                }}
                className="px-2 py-1 text-slate-400 hover:text-white hover:bg-slate-800 border-l border-slate-800 text-xs font-bold cursor-pointer"
                title="Abrir ecualizador emergente"
              >
                +
              </button>
            </div>

            {isEqPopupOpen && (
              <div className="absolute bottom-12 right-0 w-88 p-3.5 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl z-50 animate-fadeIn font-mono text-xs">
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sliders size={13} style={{ color: accentColor }} />
                    <span className="font-bold text-slate-100 uppercase tracking-wide">
                      Audio EQ
                    </span>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold border"
                      style={{
                        borderColor: isEqActive ? accentColor : "#334155",
                        color: isEqActive ? accentColor : "#64748b",
                        backgroundColor: isEqActive ? `${accentColor}15` : "#0f172a",
                      }}
                    >
                      {isEqActive ? "ON" : "BYPASS"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      onChange={(e) => {
                        const presets: Record<string, number[]> = {
                          flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                          rock: [4, 3, 2, 0, 0, 0, 1, 2, 3, 3],
                          bass: [5, 4, 3, 1, 0, 0, 0, 0, 1, 1],
                          pop: [-1, 1, 3, 4, 4, 3, 1, -1, -1, -1],
                          jazz: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
                          vocal: [-2, -1, 0, 3, 4, 4, 3, 1, 0, -1],
                          electronic: [4, 3.5, 1, 0, -1, 2, 1, 3, 4, 4],
                          audiophile: [1, 0.5, 0, 0, 0, 0, 0, 0.5, 1, 1.5],
                        };
                        const selected = presets[e.target.value];
                        if (selected) {
                          setAudioSettings({ eqGains: selected, isEqEnabled: true });
                        }
                      }}
                      defaultValue=""
                      className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none"
                    >
                      <option value="" disabled>Presets Soundix</option>
                      <option value="flat">Plano (0 dB)</option>
                      <option value="rock">Rock</option>
                      <option value="bass">Bass Boost</option>
                      <option value="pop">Pop</option>
                      <option value="jazz">Jazz</option>
                      <option value="vocal">Voz / Presencia</option>
                      <option value="electronic">Electrónica</option>
                      <option value="audiophile">Audiophile Master</option>
                    </select>

                    <button
                      onClick={() => setIsEqPopupOpen(false)}
                      className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center gap-1 h-28 py-1">
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
                          className="h-16 w-1.5 appearance-none bg-slate-800 rounded cursor-pointer"
                          style={{
                            writingMode: "vertical-lr",
                            direction: "rtl",
                            accentColor,
                          }}
                        />
                        <span className="text-[8px] text-slate-400 font-bold">{freq}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setAudioSettings({ isXdssEnabled: !isXdssActive })}
                      className={`px-2 py-0.5 rounded font-bold border transition cursor-pointer flex items-center gap-1 ${
                        isXdssActive
                          ? "border-amber-500 bg-amber-950/60 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                          : "border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                      title="LG XDSS Plus: Realce dinámico extremo de graves y pegada punch"
                    >
                      <Flame size={10} />
                      XDSS Plus
                    </button>
                    <button
                      onClick={() => setAudioSettings({ isXtsProEnabled: !isXtsProActive })}
                      className="px-2 py-0.5 rounded font-bold border transition cursor-pointer flex items-center gap-1"
                      style={{
                        borderColor: isXtsProActive ? accentColor : "#334155",
                        color: isXtsProActive ? accentColor : "#94a3b8",
                        backgroundColor: isXtsProActive ? `${accentColor}15` : "transparent",
                      }}
                      title="LG XTS Pro: Excelente balance de frecuencias altas y expansión acústica"
                    >
                      <Layers size={10} />
                      XTS Pro
                    </button>
                  </div>

                  <button
                    onClick={() => setAudioSettings({ eqGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] })}
                    className="text-slate-400 hover:text-white underline text-[9px] cursor-pointer"
                  >
                    Reset 0dB
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* NORM Button */}
          <button
            onClick={() => setAudioSettings({ isNormalizerEnabled: !isNormActive })}
            className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold border transition cursor-pointer ${
              isNormActive
                ? "border-emerald-500 bg-emerald-950/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : "border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
            }`}
            title="Normalizador & Limitador de Loudness"
          >
            NORM
          </button>

          <button
            onClick={handleToggleBitPerfect}
            className={`h-6 w-6 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer ${bitPerfectMode ? "bg-cyan-950/40 text-cyan-300" : "bg-slate-900 text-slate-500 hover:text-slate-300"} ${bitPerfectPulse ? "scale-105 ring-2" : ""}`}
            style={{ borderColor: bitPerfectMode ? accentColor : undefined, color: bitPerfectMode ? accentColor : undefined, boxShadow: bitPerfectMode ? `0 0 8px ${accentColor}40` : undefined }}
            title={`Bit-perfect: ${bitPerfectMode ? "activado" : "desactivado"}`}
            aria-label="Activar o desactivar Bit-perfect"
          >
            <Sparkles size={11} />
          </button>

          {/* STEREO/MONO Badge */}
          <div
            className="font-mono text-[10px] font-bold tracking-wider px-2 py-1 rounded bg-slate-900 border border-slate-800"
            style={{
              color: accentColor,
              boxShadow: appearance.neonGlow ? `0 0 10px ${accentColor}22` : undefined,
            }}
          >
            {isMono ? "MONO" : "STEREO"}
          </div>

          {/* Speaker Device Icon */}
          <div className="relative">
            <button
              onClick={() => {
                setIsDeviceMenuOpen(!isDeviceMenuOpen);
                setIsEqPopupOpen(false);
              }}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition flex items-center justify-center cursor-pointer"
              title={`Dispositivo de salida: ${selectedDevice}`}
            >
              <Speaker size={15} style={{ color: accentColor }} />
            </button>

            {isDeviceMenuOpen && (
              <div className="absolute bottom-10 right-0 w-64 p-2 rounded-xl bg-slate-950 border border-slate-700 shadow-2xl z-50 font-mono text-xs animate-fadeIn">
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
                      className="w-full text-left px-2.5 py-1.5 rounded text-[11px] truncate transition cursor-pointer"
                      style={{
                        backgroundColor: selectedDevice === dev ? `${accentColor}20` : "transparent",
                        color: selectedDevice === dev ? accentColor : "#cbd5e1",
                        borderColor: selectedDevice === dev ? accentColor : "transparent",
                      }}
                    >
                      {dev}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lower Row: Volume Slider with Percentage */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVolume(volume > 0 ? 0 : 1)}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Silenciar / Activar audio"
          >
            {volume === 0 ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          <input
            type="range"
            min={0}
            max={maxVolumeLimit}
            step={0.01}
            value={volume}
            onChange={handleVolume}
            className={`w-36 h-1 rounded-lg appearance-none cursor-pointer transition-all ${
              isBoosted ? "bg-rose-950" : "bg-slate-800"
            }`}
            style={{
              accentColor: isBoosted ? "#ef4444" : accentColor,
            }}
            title={`Volumen: ${volumePercentage}%`}
          />

          <span
            className={`text-[10px] font-mono font-bold min-w-[32px] text-right transition-colors ${
              isBoosted ? "text-rose-500 font-extrabold animate-pulse" : ""
            }`}
            style={{
              color: isBoosted ? "#ef4444" : accentColor,
            }}
          >
            {volumePercentage}%
          </span>
        </div>
      </div>
    </footer>
  );
};
