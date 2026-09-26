import { useState, useRef, useEffect } from "react";
import {
  X,
  Zap,
  Music,
  ChevronDown,
  RefreshCw,
  Radio,
  SlidersHorizontal,
  Flame,
  Disc3,
  Layers,
} from "lucide-react";
import { useMusicStore } from "../../store/index.ts";

export interface EqBand {
  freq: number;
  gain: number;
  q: number;
}

const DEFAULT_BANDS: EqBand[] = [
  { freq: 32, gain: 0, q: 1.4 },
  { freq: 64, gain: 0, q: 1.4 },
  { freq: 125, gain: 0, q: 1.4 },
  { freq: 250, gain: 0, q: 1.4 },
  { freq: 500, gain: 0, q: 1.4 },
  { freq: 1000, gain: 0, q: 1.4 },
  { freq: 2000, gain: 0, q: 1.4 },
  { freq: 4000, gain: 0, q: 1.4 },
  { freq: 8000, gain: 0, q: 1.4 },
  { freq: 16000, gain: 0, q: 1.4 },
];

const BAND_LABELS = ["32", "64", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];
const BAND_NAMES = [
  "Sub",
  "Bajo prof.",
  "Bajo",
  "Low-mid",
  "Mid",
  "Upper mid",
  "Pres.",
  "Claridad",
  "Aire",
  "Brillo",
];

export interface Preset {
  name: string;
  gains: number[];
  sub?: number;
  bass?: number;
}

export const SOUNDIX_PRESETS: Preset[] = [
  { name: "Plano", gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: "Acústica", gains: [2, 2, 1, 1, 0, 0, 1, 2, 2, 1] },
  { name: "Bass Boost", gains: [8, 7, 5, 2, 0, 0, 0, 0, 0, 0], sub: 3, bass: 4 },
  { name: "Blues", gains: [5, 6, 4, 2, 0, -1, 2, 3, 2, 1], sub: 3.5, bass: 4.5 },
  { name: "Brillante", gains: [0, 0, 0, 0, 0, 1, 2, 3, 5, 6] },
  { name: "Cinema", gains: [5, 4, 2, 0, -1, 0, 1, 2, 3, 3] },
  { name: "Clásica", gains: [-2, 0, 0, 0, 0, 0, 0, 1, 2, 2] },
  { name: "Electrónica", gains: [6, 5, 2, -1, -2, 0, 1, 2, 4, 5] },
  { name: "Hip-hop", gains: [8, 7, 4, 1, -1, -1, 0, 1, 1, 0] },
  { name: "Jazz", gains: [2, 2, 1, 0, -1, -1, 0, 1, 2, 1] },
  { name: "Lo-Fi", gains: [2, 3, 2, 0, -1, -2, -3, -4, -5, -6] },
  { name: "Podcast", gains: [-4, -2, 0, 2, 4, 3, 2, 1, 0, 0] },
  { name: "Pop", gains: [1, 2, 3, 1, -1, -2, -1, 1, 2, 3] },
  { name: "Rock", gains: [4, 3, 2, 0, -1, -1, 0, 2, 3, 4] },
  { name: "Vocal/Voz", gains: [-2, 0, 0, 2, 4, 4, 3, 2, 1, 0] },
  { name: "Warm", gains: [2, 2, 1, 0, -1, -2, -2, -1, 0, 0] },
];

function colorToRgba(color: string, alpha: number): string {
  const trimmed = (color || "").trim();
  if (trimmed.startsWith("#")) {
    let c = trimmed.slice(1);
    if (c.length === 3) c = c.split("").map((x) => x + x).join("");
    const num = parseInt(c, 16);
    if (!isNaN(num)) {
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      return `rgba(${r},${g},${b},${alpha})`;
    }
  }
  const match = trimmed.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (match) {
    return `rgba(${match[1]},${match[2]},${match[3]},${alpha})`;
  }
  return `rgba(6,182,212,${alpha})`;
}

export function FreqResponseCanvas({
  bands,
  highpass,
  lowpass,
  accentColor,
}: {
  bands: EqBand[];
  highpass?: number;
  lowpass?: number;
  accentColor: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const activeColor = accentColor || "#06b6d4";

    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (const db of [-12, -6, 0, 6, 12]) {
      const y = H / 2 - (db / 12) * (H / 2 - 10);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();

    const freqAt = (x: number) => 20 * Math.pow(10, (x / W) * Math.log10(20000 / 20));
    const dbResponse = new Float32Array(W);

    for (let x = 0; x < W; x++) {
      const f = freqAt(x);
      let totalDb = 0;

      if (highpass && highpass > 0) {
        const ratio = f / highpass;
        if (ratio < 1) totalDb += 20 * Math.log10(ratio * ratio);
      }
      if (lowpass && lowpass > 0 && lowpass < 22000) {
        const ratio = f / lowpass;
        if (ratio > 1) totalDb += 20 * Math.log10(1 / (ratio * ratio));
      }

      for (const band of bands) {
        if (Math.abs(band.gain) < 0.05) continue;
        const q = band.q || 1.4;
        const w = 2 * Math.PI * f;
        const w0 = 2 * Math.PI * band.freq;
        const A = Math.pow(10, band.gain / 40);
        const bw = w0 / q;

        const num = (w0 * w0 - w * w) * (w0 * w0 - w * w) + (A * bw * w) * (A * bw * w);
        const den = (w0 * w0 - w * w) * (w0 * w0 - w * w) + ((bw * w) / A) * ((bw * w) / A);
        if (den > 0 && num > 0) {
          totalDb += 10 * Math.log10(num / den);
        }
      }

      dbResponse[x] = totalDb;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, colorToRgba(activeColor, 0.45));
    gradient.addColorStop(0.5, colorToRgba(activeColor, 0.16));
    gradient.addColorStop(1, colorToRgba(activeColor, 0.02));

    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const db = Math.max(-18, Math.min(18, dbResponse[x]));
      const y = H / 2 - (db / 18) * (H / 2 - 6);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(W - 1, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const db = Math.max(-18, Math.min(18, dbResponse[x]));
      const y = H / 2 - (db / 18) * (H / 2 - 6);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 6;
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }, [bands, highpass, lowpass, accentColor]);

  return <canvas ref={canvasRef} width={640} height={130} className="w-full h-full" />;
}

export function AudioEQModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { audioSettings, setAudioSettings, appearance } = useMusicStore();
  const accentColor = appearance.accentColor || "#06b6d4";

  const [activePreset, setActivePreset] = useState("Plano");
  const [showPresetsPanel, setShowPresetsPanel] = useState(false);

  const [subBoost, setSubBoost] = useState(0);
  const [bassBoost, setBassBoost] = useState(0);
  const [highpass, setHighpass] = useState(0);
  const [lowpass, setLowpass] = useState(0);

  const [targetLufs, setTargetLufs] = useState(-14);
  const [truePeak, setTruePeak] = useState(-1.5);
  const [lra, setLra] = useState(11);
  const [normalizeMode, setNormalizeMode] = useState<"ebur128" | "dynaudnorm">("ebur128");

  const [vinylSim, setVinylSim] = useState(false);

  if (!isOpen) return null;

  const currentGains = audioSettings.eqGains || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const bands: EqBand[] = DEFAULT_BANDS.map((b, idx) => ({
    ...b,
    gain: currentGains[idx] ?? 0,
  }));

  const updateBandGain = (index: number, gain: number) => {
    const nextGains = [...currentGains];
    nextGains[index] = Math.round(gain * 10) / 10;
    setAudioSettings({ eqGains: nextGains });
    setActivePreset("Personalizado");
  };

  const applyPreset = (p: Preset) => {
    setActivePreset(p.name);
    setAudioSettings({ eqGains: [...p.gains] });
    if (p.sub !== undefined) setSubBoost(p.sub);
    if (p.bass !== undefined) setBassBoost(p.bass);
  };

  const resetEq = () => {
    setActivePreset("Plano");
    setAudioSettings({ eqGains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] });
    setSubBoost(0);
    setBassBoost(0);
    setHighpass(0);
    setLowpass(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div
        className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700/80 bg-slate-900/95 shadow-2xl p-5 flex flex-col gap-4 text-slate-100"
        style={{
          boxShadow: appearance.neonGlow ? `0 0 35px ${accentColor}30` : undefined,
        }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
            >
              <SlidersHorizontal size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide flex items-center gap-2">
                Audio EQ PRO &bull; Soundix Hi-Fi Engine
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-mono uppercase border"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    borderColor: `${accentColor}40`,
                    color: accentColor,
                  }}
                >
                  Estudio 10-Bandas
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Curva paramétrica biquad en tiempo real, normalizador EBU R128 y filtros DSP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioSettings({ isEqEnabled: !audioSettings.isEqEnabled })}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer"
              style={
                audioSettings.isEqEnabled
                  ? {
                      backgroundColor: `${accentColor}25`,
                      borderColor: `${accentColor}80`,
                      color: accentColor,
                      boxShadow: `0 0 12px ${accentColor}40`,
                    }
                  : {
                      backgroundColor: "rgba(255,255,255,0.05)",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.4)",
                    }
              }
            >
              <Zap size={13} />
              {audioSettings.isEqEnabled ? "ECUALIZADOR ON" : "ECUALIZADOR OFF"}
            </button>

            <button
              onClick={() => setAudioSettings({ isXdssEnabled: !audioSettings.isXdssEnabled })}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer"
              style={
                audioSettings.isXdssEnabled
                  ? {
                      backgroundColor: `${accentColor}20`,
                      borderColor: `${accentColor}70`,
                      color: accentColor,
                    }
                  : {
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.4)",
                    }
              }
              title="XDSS Plus: Extreme Dynamic Sound System"
            >
              <Flame size={12} />
              XDSS Plus
            </button>

            <button
              onClick={() => setAudioSettings({ isXtsProEnabled: !audioSettings.isXtsProEnabled })}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer"
              style={
                audioSettings.isXtsProEnabled
                  ? {
                      backgroundColor: `${accentColor}20`,
                      borderColor: `${accentColor}70`,
                      color: accentColor,
                    }
                  : {
                      backgroundColor: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.4)",
                    }
              }
              title="XTS Pro: Excelente resolución de agudos"
            >
              <Layers size={12} />
              XTS Pro
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowPresetsPanel(!showPresetsPanel)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200 hover:border-slate-500 transition cursor-pointer"
              >
                <Music size={12} style={{ color: accentColor }} />
                <span>{activePreset}</span>
                <ChevronDown size={12} />
              </button>
              {showPresetsPanel && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 w-48 max-h-60 overflow-y-auto">
                  {SOUNDIX_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => {
                        applyPreset(p);
                        setShowPresetsPanel(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                        activePreset === p.name
                          ? "font-bold"
                          : "text-slate-300 hover:bg-slate-700/60 hover:text-white"
                      }`}
                      style={
                        activePreset === p.name
                          ? { backgroundColor: `${accentColor}25`, color: accentColor }
                          : undefined
                      }
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={resetEq}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 hover:text-white hover:border-slate-500 transition cursor-pointer"
              title="Restablecer EQ a 0 dB"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        <div className="w-full h-32 rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-inner relative">
          <FreqResponseCanvas
            bands={audioSettings.isEqEnabled ? bands : DEFAULT_BANDS.map((b) => ({ ...b, gain: 0 }))}
            highpass={highpass > 0 ? highpass : undefined}
            lowpass={lowpass > 0 ? lowpass : undefined}
            accentColor={accentColor}
          />
          <div className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500 pointer-events-none">
            20 Hz - 20 kHz &bull; Bi-Quad IIR Filters
          </div>
        </div>

        <div
          className={`flex gap-1 justify-between bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 transition-opacity ${
            !audioSettings.isEqEnabled ? "opacity-35 pointer-events-none" : ""
          }`}
        >
          {bands.map((band, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <span
                className="text-[10px] font-mono font-bold"
                style={
                  band.gain > 0.5
                    ? { color: accentColor }
                    : band.gain < -0.5
                    ? { color: "#f87171" }
                    : { color: "rgba(255,255,255,0.4)" }
                }
              >
                {band.gain > 0 ? `+${band.gain.toFixed(1)}` : band.gain.toFixed(1)}
              </span>

              <div className="relative flex flex-col items-center" style={{ height: 120 }}>
                {[-12, -6, 0, 6, 12].map((db) => (
                  <div
                    key={db}
                    className={`absolute left-1/2 -translate-x-1/2 w-2 h-px pointer-events-none ${
                      db === 0 ? "bg-slate-400/40" : "bg-slate-700/40"
                    }`}
                    style={{
                      top: `${((12 - db) / 24) * 110 + 5}px`,
                    }}
                  />
                ))}
                <input
                  type="range"
                  min={-12}
                  max={12}
                  step={0.5}
                  value={band.gain}
                  onChange={(e) => updateBandGain(i, parseFloat(e.target.value))}
                  style={{
                    writingMode: "vertical-lr",
                    direction: "rtl",
                    WebkitAppearance: "slider-vertical",
                    height: 120,
                    width: 24,
                    cursor: "pointer",
                    accentColor,
                  }}
                  title={`${BAND_NAMES[i]}: ${band.gain > 0 ? "+" : ""}${band.gain.toFixed(1)} dB`}
                />
              </div>

              <span className="text-[10px] text-slate-300 font-mono font-bold">{BAND_LABELS[i]}</span>
              <span className="text-[9px] text-slate-500 text-center leading-tight truncate w-full">
                {BAND_NAMES[i]}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Sub Boost</span>
              <span className="font-mono font-bold" style={{ color: accentColor }}>
                {subBoost > 0 ? `+${subBoost}` : subBoost} dB
              </span>
            </div>
            <input
              type="range"
              min={-6}
              max={12}
              step={0.5}
              value={subBoost}
              onChange={(e) => setSubBoost(parseFloat(e.target.value))}
              style={{ accentColor, cursor: "pointer" }}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Bass Boost</span>
              <span className="font-mono font-bold" style={{ color: accentColor }}>
                {bassBoost > 0 ? `+${bassBoost}` : bassBoost} dB
              </span>
            </div>
            <input
              type="range"
              min={-6}
              max={12}
              step={0.5}
              value={bassBoost}
              onChange={(e) => setBassBoost(parseFloat(e.target.value))}
              style={{ accentColor, cursor: "pointer" }}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Highpass</span>
              <span className="font-mono text-slate-400">{highpass > 0 ? `${highpass} Hz` : "Off"}</span>
            </div>
            <input
              type="range"
              min={0}
              max={400}
              step={5}
              value={highpass}
              onChange={(e) => setHighpass(parseInt(e.target.value))}
              style={{ accentColor, cursor: "pointer" }}
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Lowpass</span>
              <span className="font-mono text-slate-400">
                {lowpass > 0 && lowpass < 22000 ? `${(lowpass / 1000).toFixed(1)}k Hz` : "Off"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={22000}
              step={500}
              value={lowpass}
              onChange={(e) => setLowpass(parseInt(e.target.value))}
              style={{ accentColor, cursor: "pointer" }}
              className="w-full"
            />
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={16} style={{ color: accentColor }} />
              <div>
                <span className="text-xs font-bold text-slate-200">
                  Normalizador de Loudness Integrado
                </span>
                <span className="ml-2 text-[10px] text-slate-400">
                  EBU R128 &bull; Dynaudnorm &bull; True Peak
                </span>
              </div>
            </div>
            <button
              onClick={() =>
                setAudioSettings({ isNormalizerEnabled: !audioSettings.isNormalizerEnabled })
              }
              className="relative w-11 h-6 rounded-full transition-colors cursor-pointer"
              style={{
                backgroundColor: audioSettings.isNormalizerEnabled
                  ? accentColor
                  : "rgba(255,255,255,0.15)",
              }}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                  audioSettings.isNormalizerEnabled ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>

          <div
            className={`flex flex-col gap-3 transition-opacity ${
              !audioSettings.isNormalizerEnabled ? "opacity-35 pointer-events-none" : ""
            }`}
          >
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "ebur128", label: "EBU R128", desc: "Estándar broadcast / streaming internacional" },
                { id: "dynaudnorm", label: "Dinámico (Dynaudnorm)", desc: "Compresión dinámica continua multibanda" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setNormalizeMode(m.id as "ebur128" | "dynaudnorm")}
                  className="flex flex-col items-start px-3 py-2 rounded-xl border transition cursor-pointer text-left"
                  style={
                    normalizeMode === m.id
                      ? {
                          backgroundColor: `${accentColor}18`,
                          borderColor: `${accentColor}70`,
                        }
                      : {
                          backgroundColor: "rgba(255,255,255,0.03)",
                          borderColor: "rgba(255,255,255,0.08)",
                        }
                  }
                >
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: normalizeMode === m.id ? accentColor : "rgba(255,255,255,0.8)",
                    }}
                  >
                    {m.label}
                  </span>
                  <span className="text-[10px] text-slate-400">{m.desc}</span>
                </button>
              ))}
            </div>

            {normalizeMode === "ebur128" && (
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Target LUFS</span>
                    <span className="font-mono font-bold" style={{ color: accentColor }}>
                      {targetLufs} LUFS
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-23}
                    max={-9}
                    step={0.5}
                    value={targetLufs}
                    onChange={(e) => setTargetLufs(parseFloat(e.target.value))}
                    className="w-full"
                    style={{ accentColor, cursor: "pointer" }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">True Peak</span>
                    <span className="font-mono text-slate-300">{truePeak} dBTP</span>
                  </div>
                  <input
                    type="range"
                    min={-9}
                    max={0}
                    step={0.5}
                    value={truePeak}
                    onChange={(e) => setTruePeak(parseFloat(e.target.value))}
                    className="w-full"
                    style={{ accentColor, cursor: "pointer" }}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Rango LRA</span>
                    <span className="font-mono text-slate-300">{lra} LU</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={lra}
                    onChange={(e) => setLra(parseInt(e.target.value))}
                    className="w-full"
                    style={{ accentColor, cursor: "pointer" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800">
          <div className="flex items-center gap-2">
            <Disc3
              size={16}
              className={vinylSim ? "animate-spin" : ""}
              style={{
                color: vinylSim ? accentColor : "rgba(255,255,255,0.4)",
                animationDuration: "3s",
              }}
            />
            <div>
              <span className="text-xs font-semibold text-slate-200">
                Simulación de Vinilo Analógico 33.3 RPM
              </span>
              <p className="text-[10px] text-slate-400">
                Añade micro-calidez armónica par y saturación de aguja magnética
              </p>
            </div>
          </div>
          <button
            onClick={() => setVinylSim(!vinylSim)}
            className="px-3 py-1 rounded-lg text-xs font-mono font-semibold border transition cursor-pointer"
            style={
              vinylSim
                ? {
                    backgroundColor: `${accentColor}25`,
                    borderColor: `${accentColor}80`,
                    color: accentColor,
                  }
                : {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.4)",
                  }
            }
          >
            {vinylSim ? "33.3 RPM ACTIVO" : "INACTIVO"}
          </button>
        </div>
      </div>
    </div>
  );
}
