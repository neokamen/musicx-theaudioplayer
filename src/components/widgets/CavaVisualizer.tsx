import React, { useEffect, useRef } from "react";
import { useMusicStore } from "../../store/index.ts";

export const CavaVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const telemetry = useMusicStore((state) => state.telemetry);
  const isPlaying = useMusicStore((state) => state.isPlaying);
  const appearance = useMusicStore((state) => state.appearance);
  const latestState = useRef({ telemetry, isPlaying, appearance });
  latestState.current = { telemetry, isPlaying, appearance };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const count = Math.max(16, Math.min(128, appearance.cavaBars || 64));
    const levels = new Float32Array(count);
    const peaks = new Float32Array(count);
    let frameId = 0;
    let previousFrame = 0;
    let elapsed = 0;
    let canvasWidth = 0;
    let canvasHeight = 0;

    const drawFluidLayer = (
      width: number,
      height: number,
      baseline: number,
      scale: number,
      phase: number,
      fill: string | CanvasGradient,
      alpha: number,
      stroke?: string,
      inverted = false,
    ) => {
      const points = Array.from({ length: count }, (_, index) => {
        const x = (index / (count - 1)) * width;
        const modulation = 0.88 + Math.sin(index * 0.24 + phase) * 0.12;
        const offset = levels[index] * height * scale * modulation;
        const y = inverted ? baseline + offset : baseline - offset;
        return { x, y };
      });

      context.beginPath();
      context.moveTo(0, baseline);
      context.lineTo(points[0].x, points[0].y);
      for (let index = 1; index < points.length; index++) {
        const previous = points[index - 1];
        const current = points[index];
        const midpointX = (previous.x + current.x) / 2;
        const midpointY = (previous.y + current.y) / 2;
        context.quadraticCurveTo(previous.x, previous.y, midpointX, midpointY);
      }
      const lastPoint = points[points.length - 1];
      context.lineTo(lastPoint.x, lastPoint.y);
      context.lineTo(width, baseline);
      context.closePath();

      context.globalAlpha = alpha;
      context.fillStyle = fill;
      context.fill();
      if (stroke) {
        context.globalAlpha = Math.min(1, alpha + 0.24);
        context.strokeStyle = stroke;
        context.lineWidth = 1.4;
        context.stroke();
      }
    };

    const render = (time: number) => {
      frameId = requestAnimationFrame(render);
      const { telemetry: liveTelemetry, isPlaying: liveIsPlaying, appearance: liveAppearance } = latestState.current;
      const fps = Math.max(30, liveAppearance.spectrumFps || 60);
      if (time - previousFrame < 1000 / fps) return;
      const delta = Math.min((time - (previousFrame || time)) / 1000, 0.08);
      previousFrame = time;
      elapsed += delta;

      const bounds = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      if (bounds.width !== canvasWidth || bounds.height !== canvasHeight) {
        canvasWidth = bounds.width;
        canvasHeight = bounds.height;
        canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
        canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
      }
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, bounds.width, bounds.height);

      const width = bounds.width;
      const height = bounds.height;
      const spectrum = liveTelemetry.spectrum || [];
      const playing = liveIsPlaying || liveTelemetry.state === "Playing";
      const sensitivity = (liveAppearance.cavaSensitivity || 100) / 100;
      const hasSignal = playing && (spectrum.some((value) => value > 0.002) || liveAppearance.cavaOfflineFallback);
      const smoothing = (liveAppearance.cavaSmoothing || 0) / 100;

      for (let index = 0; index < count; index++) {
        const sourceIndex = spectrum.length
          ? Math.min(spectrum.length - 1, Math.floor(index / count * spectrum.length))
          : -1;
        const synthetic = liveAppearance.cavaOfflineFallback && playing
          ? (0.08 + (Math.sin(elapsed * 4.1 + index * 0.21) + 1) * 0.16 + Math.sin(elapsed * 1.7 - index * 0.09) * 0.06)
          : 0;
        const target = sourceIndex >= 0
          ? Math.min(1, Math.max(0, Math.pow(spectrum[sourceIndex] || 0, 0.72) * sensitivity * 1.7))
          : synthetic;
        const attackRate = liveAppearance.cavaGravity === "instant" ? 30 : 12 - smoothing * 8;
        const attack = Math.min(1, delta * attackRate);
        const release = (liveAppearance.cavaGravity === "studio" ? 1.8 : 3.2) * (1 - smoothing * 0.82);
        if (playing && target > levels[index]) levels[index] += (target - levels[index]) * attack;
        else levels[index] = Math.max(target, levels[index] - delta * release);
        peaks[index] = liveAppearance.cavaPeakHold
          ? Math.max(levels[index], peaks[index] - delta * release * 0.28)
          : levels[index];
      }

      if (!hasSignal) return;

      const accent = liveAppearance.accentColor || "#06b6d4";
      const fluidGradient = context.createLinearGradient(0, height, width * 0.72, 0);
      if (liveAppearance.cavaPalette === "fire") {
        fluidGradient.addColorStop(0, "#ffb000");
        fluidGradient.addColorStop(0.52, "#ff4b2b");
        fluidGradient.addColorStop(1, "#b51735");
      } else if (liveAppearance.cavaPalette === "mono") {
        fluidGradient.addColorStop(0, "#64748b");
        fluidGradient.addColorStop(0.52, "#cbd5e1");
        fluidGradient.addColorStop(1, "#ffffff");
      } else if (liveAppearance.cavaPalette === "accent") {
        fluidGradient.addColorStop(0, accent);
        fluidGradient.addColorStop(0.52, accent);
        fluidGradient.addColorStop(1, "#ffffff");
      } else {
        fluidGradient.addColorStop(0, "#13d8cb");
        fluidGradient.addColorStop(0.52, accent);
        fluidGradient.addColorStop(1, "#ed65bd");
      }
      const deepGradient = context.createLinearGradient(0, height, width * 0.3, height * 0.18);
      deepGradient.addColorStop(0, "#0b879b");
      deepGradient.addColorStop(1, accent);

      context.save();
      context.shadowColor = accent;
      context.shadowBlur = 22;
      const baseline = liveAppearance.cavaMirrored ? height * 0.5 : height * 0.84;
      const scale = liveAppearance.cavaMirrored ? 0.62 : 0.88;
      drawFluidLayer(width, height, liveAppearance.cavaMirrored ? baseline : height * 0.92, liveAppearance.cavaMirrored ? 0.62 : 0.74, elapsed * 0.45, deepGradient, 0.24);
      drawFluidLayer(width, height, baseline, scale, -elapsed * 0.62, fluidGradient, 0.68, accent);
      if (liveAppearance.cavaMirrored) {
        drawFluidLayer(width, height, baseline, scale, -elapsed * 0.62, fluidGradient, 0.36, accent, true);
      }
      if (liveAppearance.cavaPeakHold) {
        context.beginPath();
        for (let index = 0; index < count; index++) {
          const x = (index / (count - 1)) * width;
          const y = baseline - peaks[index] * height * scale;
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = "rgba(255,255,255,0.68)";
        context.lineWidth = 1;
        context.stroke();
      }
      context.shadowBlur = 8;
      drawFluidLayer(width, height, liveAppearance.cavaMirrored ? baseline : height * 0.78, 0.42, elapsed * 0.88, "#ffffff", 0.16, "#ffffff", liveAppearance.cavaMirrored);
      context.restore();
      context.globalAlpha = 1;
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [appearance.cavaBars]);

  return (
    <div className="h-full w-full min-h-0 bg-slate-950 p-2 flex items-stretch relative overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full" aria-label="Visualizador CAVA fluido en tiempo real" />
      {(isPlaying || telemetry.state === "Playing") && (telemetry.spectrum.some((value) => value > 0.002) || appearance.cavaOfflineFallback) ? (
        <span className="absolute right-4 top-3 rounded-full border border-emerald-400/30 bg-slate-950/70 px-2 py-1 font-mono text-[9px] text-emerald-300">CAVA EN VIVO</span>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-wider text-slate-500">CAVA · ESPERANDO AUDIO</span>
      )}
    </div>
  );
};