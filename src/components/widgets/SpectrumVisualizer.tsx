import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/index.ts';

export type SpectrumStyle =
  | 'bars'
  | 'wave'
  | 'circular'
  | 'oscilloscope'
  | 'stereo_vu'
  | 'neon_pulse'
  | 'led_matrix'
  | 'mirror'
  | 'gradient_flow'
  | 'peak_meter';

export const SPECTRUM_STYLES: { id: SpectrumStyle; name: string }[] = [
  { id: 'bars', name: 'Espectro de Barras Hi-Fi' },
  { id: 'wave', name: 'Onda Fluida Continua' },
  { id: 'circular', name: 'Espectro Radial / Circular' },
  { id: 'oscilloscope', name: 'Osciloscopio Láser' },
  { id: 'stereo_vu', name: 'Vúmetro Estéreo (L / R)' },
  { id: 'neon_pulse', name: 'Anillos Neón Pulsantes' },
  { id: 'led_matrix', name: 'Matriz LED de Segmentos' },
  { id: 'mirror', name: 'Espectro Simétrico Espejo' },
  { id: 'gradient_flow', name: 'Cinta Térmica Fluida' },
  { id: 'peak_meter', name: 'Caída de Picos con Gravedad' },
];

export interface SpectrumVisualizerProps {
  height?: number;
}

export const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const telemetry = useAppStore((s) => s.telemetry);
  const isPlayingStore = useAppStore((s) => s.isPlaying);
  const storeVolume = useAppStore((s) => s.volume);
  const appearance = useAppStore((s) => s.appearance);
  const setAppearance = useAppStore((s) => s.setAppearance);

  const isPlaying = (isPlayingStore || telemetry.state === 'Playing') && telemetry.state !== 'Stopped' && telemetry.state !== 'Paused';
  const volume = telemetry.volume ?? storeVolume ?? 1;
  const numBands = Math.max(16, Math.min(128, appearance.cavaBars || 64));

  // Double-click to cycle spectrum visualizer styles
  const handleDoubleClick = () => {
    const currentStyle = appearance.spectrumStyle || 'bars';
    const currentIndex = SPECTRUM_STYLES.findIndex((s) => s.id === currentStyle);
    const nextIndex = (currentIndex + 1) % SPECTRUM_STYLES.length;
    setAppearance({ spectrumStyle: SPECTRUM_STYLES[nextIndex].id });
  };

  // Ultra-fluid 60 FPS continuous physics rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const currentBands = new Float32Array(numBands);
    const peaks = new Float32Array(numBands);
    const peakVelocity = new Float32Array(numBands);
    const frameInterval = 1000 / Math.max(30, appearance.spectrumFps || 60);

    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      if (now - lastTime < frameInterval) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (w === 0 || h === 0) return;

      const accent = appearance.cavaPalette === 'fire'
        ? '#ff5a36'
        : appearance.cavaPalette === 'mono'
        ? '#cbd5e1'
        : appearance.accentColor || '#06b6d4';
      const timeSec = now / 1000;

      // Extract real audio spectrum values from Rust telemetry
      const targetBands = telemetry.spectrum && telemetry.spectrum.length > 0
        ? telemetry.spectrum
        : [];

      for (let i = 0; i < numBands; i++) {
        if (!isPlaying || volume === 0) {
          // Smooth decay when paused/stopped
          currentBands[i] = Math.max(0, currentBands[i] - dt * 2.5);
        } else if (targetBands.length > 0) {
          const specIdx = Math.floor((i / numBands) * targetBands.length);
          const rawVal = Math.max(0, Math.min(1.0, (targetBands[specIdx] || 0) * (volume > 1 ? 1 : volume) * 1.35 * (appearance.cavaSensitivity / 100)));
          // Exponential decay/attack interpolation (ultra smooth curve style)
          const factor = 1 - Math.exp(-dt * (22 - appearance.cavaSmoothing * 0.16));
          currentBands[i] += (rawVal - currentBands[i]) * factor;
        } else if (appearance.cavaOfflineFallback) {
          // Dynamic organic wave synthesis during active playback
          const synth = (Math.sin(timeSec * 5 + i * 0.4) * 0.4 + 0.5) * Math.min(1, volume) * 0.85 * (appearance.cavaSensitivity / 100);
          const factor = 1 - Math.exp(-dt * (18 - appearance.cavaSmoothing * 0.12));
          currentBands[i] += (synth - currentBands[i]) * factor;
        } else {
          currentBands[i] = Math.max(0, currentBands[i] - dt * 2.5);
        }

        // Gravity physics for peaks
        if (!appearance.cavaPeakHold || appearance.cavaGravity === 'instant') {
          peaks[i] = currentBands[i];
          peakVelocity[i] = 0;
        } else if (currentBands[i] > peaks[i]) {
          peaks[i] = currentBands[i];
          peakVelocity[i] = 0;
        } else {
          peakVelocity[i] += dt * (appearance.cavaGravity === 'studio' ? 0.65 : 1.2);
          peaks[i] = Math.max(0, peaks[i] - peakVelocity[i] * dt * 60);
        }
      }

      const style = appearance.spectrumStyle || 'bars';

      switch (style) {
        case 'bars': {
          const barWidth = (w / numBands) * 0.8;
          const gap = (w / numBands) * 0.2;
          for (let i = 0; i < numBands; i++) {
            // Bars reach up to 98% of total height for full impact
            const barHeight = Math.max(2, currentBands[i] * (h - 4));
            const x = i * (barWidth + gap) + gap / 2;
            const y = h - barHeight;

            if (barHeight > 2) {
              const grad = ctx.createLinearGradient(0, h, 0, 0);
              grad.addColorStop(0, `${accent}40`);
              grad.addColorStop(0.65, accent);
              grad.addColorStop(1, '#ffffff');

              ctx.fillStyle = grad;
              ctx.shadowColor = accent;
              ctx.shadowBlur = appearance.neonGlow ? (appearance.neonIntensity / 100) * 10 : 0;
              ctx.fillRect(x, y, barWidth, barHeight);
            }

            if (peaks[i] > 0.02) {
              const peakY = Math.max(2, h - peaks[i] * (h - 4));
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(x, peakY - 2, barWidth, 2);
            }
          }
          break;
        }

        case 'wave': {
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = accent;
          ctx.shadowColor = accent;
          ctx.shadowBlur = appearance.neonGlow ? (appearance.neonIntensity / 100) * 15 : 0;

          const centerY = h / 2;
          ctx.moveTo(0, centerY);

          for (let x = 0; x < w; x += 4) {
            const idx = Math.floor((x / w) * numBands);
            const amp = currentBands[idx] * (h / 2.5);
            const waveY = centerY + (isPlaying ? Math.sin(x * 0.06 + timeSec * 14) * amp : 0);
            ctx.lineTo(x, waveY);
          }
          ctx.stroke();
          if (appearance.cavaMirrored) {
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            for (let x = 0; x < w; x += 4) {
              const idx = Math.floor((x / w) * numBands);
              const amp = currentBands[idx] * (h / 2.5);
              const waveY = centerY - (isPlaying ? Math.sin(x * 0.06 + timeSec * 14) * amp : 0);
              ctx.lineTo(x, waveY);
            }
            ctx.stroke();
          }
          break;
        }

        case 'circular': {
          const cx = w / 2;
          const cy = h / 2;
          const baseRadius = Math.min(w, h) * 0.28;

          for (let i = 0; i < numBands; i++) {
            const angle = (i / numBands) * Math.PI * 2;
            const barLen = currentBands[i] * (Math.min(w, h) * 0.25);

            const x1 = cx + Math.cos(angle) * baseRadius;
            const y1 = cy + Math.sin(angle) * baseRadius;
            const x2 = cx + Math.cos(angle) * (baseRadius + barLen);
            const y2 = cy + Math.sin(angle) * (baseRadius + barLen);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = accent;
            ctx.lineWidth = 3;
            ctx.shadowColor = accent;
            ctx.shadowBlur = appearance.neonGlow ? (appearance.neonIntensity / 100) * 10 : 0;
            ctx.stroke();
          }
          break;
        }

        case 'oscilloscope': {
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = accent;
          ctx.shadowColor = accent;
          ctx.shadowBlur = 12;

          for (let i = 0; i < numBands; i++) {
            const t = (i / numBands) * Math.PI * 2;
            const r = currentBands[i] * (h / 2.2);
            const x = w / 2 + (isPlaying ? Math.cos(t * 3 + timeSec * 5) * (r + 10) : 0);
            const y = h / 2 + (isPlaying ? Math.sin(t * 5 + timeSec * 7) * (r + 10) : 0);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
          break;
        }

        case 'stereo_vu': {
          const halfH = h / 2;
          const labels = ['CANAL L (Izquierdo)', 'CANAL R (Derecho)'];

          for (let channelIdx = 0; channelIdx < 2; channelIdx++) {
            const startY = channelIdx * halfH;
            const barHeight = halfH - 12;
            const totalSegments = 24;

            ctx.fillStyle = '#64748b';
            ctx.font = '9px monospace';
            ctx.fillText(labels[channelIdx], 8, startY + 12);

            const avgAmp = isPlaying
              ? currentBands.reduce(
                  (acc, b, idx) => (idx % 2 === channelIdx ? acc + b : acc),
                  0
                ) / (numBands / 2)
              : 0;

            const activeSegs = Math.floor(avgAmp * totalSegments);
            const segW = (w - 120) / totalSegments;

            for (let s = 0; s < totalSegments; s++) {
              const segX = 110 + s * segW;
              const isLit = s < activeSegs;

              let color = '#22c55e';
              if (s > 16) color = '#f59e0b';
              if (s > 21) color = '#ef4444';

              ctx.fillStyle = isLit ? color : '#1e293b';
              ctx.shadowColor = isLit ? color : 'transparent';
              ctx.shadowBlur = isLit && appearance.neonGlow ? 6 : 0;
              ctx.fillRect(segX, startY + 16, segW - 2, barHeight - 8);
            }
          }
          break;
        }

        case 'neon_pulse': {
          const cx = w / 2;
          const cy = h / 2;
          const maxR = Math.min(w, h) * 0.45;
          const pulseVal = isPlaying ? currentBands.reduce((a, b) => a + b, 0) / numBands : 0;

          for (let ring = 1; ring <= 4; ring++) {
            const r = (maxR / 4) * ring * (0.8 + pulseVal * 0.4);
            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(2, r), 0, Math.PI * 2);
            ctx.strokeStyle = `${accent}${Math.floor((1 - ring / 5) * 255)
              .toString(16)
              .padStart(2, '0')}`;
            ctx.lineWidth = 2 + ring;
            ctx.shadowColor = accent;
            ctx.shadowBlur = (appearance.neonIntensity / 100) * 16;
            ctx.stroke();
          }
          break;
        }

        case 'led_matrix': {
          const barWidth = w / numBands;
          const rows = 12;
          const rowH = (h - 10) / rows;

          for (let i = 0; i < numBands; i++) {
            const litRows = isPlaying ? Math.floor(currentBands[i] * rows) : 0;
            const x = i * barWidth;

            for (let r = 0; r < rows; r++) {
              const y = h - (r + 1) * rowH;
              const isLit = r < litRows;
              let segColor = accent;
              if (r > 8) segColor = '#f43f5e';

              ctx.fillStyle = isLit ? segColor : '#1e293b';
              ctx.shadowColor = isLit ? segColor : 'transparent';
              ctx.shadowBlur = isLit && appearance.neonGlow ? 4 : 0;
              ctx.fillRect(x + 1, y + 1, barWidth - 2, rowH - 2);
            }
          }
          break;
        }

        case 'mirror': {
          const halfH = h / 2;
          const barWidth = w / numBands;

          for (let i = 0; i < numBands; i++) {
            const barH = currentBands[i] * (halfH - 5);
            const x = i * barWidth;

            if (barH > 1) {
              ctx.fillStyle = accent;
              ctx.shadowColor = accent;
              ctx.shadowBlur = appearance.neonGlow ? 8 : 0;

              ctx.fillRect(x + 1, halfH - barH, barWidth - 2, barH);
              ctx.fillRect(x + 1, halfH, barWidth - 2, barH);
            }
          }
          break;
        }

        case 'gradient_flow': {
          const grad = ctx.createLinearGradient(0, 0, w, 0);
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.33, '#3b82f6');
          grad.addColorStop(0.66, '#8b5cf6');
          grad.addColorStop(1, '#ec4899');

          ctx.beginPath();
          ctx.moveTo(0, h);

          for (let i = 0; i < numBands; i++) {
            const x = (i / (numBands - 1)) * w;
            const y = h - currentBands[i] * (h - 15);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(w, h);
          ctx.closePath();

          ctx.fillStyle = grad;
          ctx.shadowColor = accent;
          ctx.shadowBlur = appearance.neonGlow ? 12 : 0;
          ctx.fill();
          break;
        }

        case 'peak_meter': {
          const barWidth = (w / numBands) * 0.8;
          const gap = (w / numBands) * 0.2;

          for (let i = 0; i < numBands; i++) {
            const x = i * (barWidth + gap);
            const barH = currentBands[i] * (h - 15);
            const y = h - barH;

            if (barH > 1) {
              ctx.fillStyle = `${accent}bb`;
              ctx.fillRect(x, y, barWidth, barH);
            }

            if (peaks[i] > 0.02) {
              const peakY = h - peaks[i] * (h - 15);
              ctx.fillStyle = '#ef4444';
              ctx.shadowColor = '#ef4444';
              ctx.shadowBlur = 8;
              ctx.fillRect(x, peakY - 3, barWidth, 3);
            }
          }
          break;
        }
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, volume, appearance, telemetry.spectrum]);

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className="w-full h-full relative rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950/90 shadow-inner cursor-pointer"
      style={height ? { height } : undefined}
      title="Doble clic para cambiar estilo de espectro"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
