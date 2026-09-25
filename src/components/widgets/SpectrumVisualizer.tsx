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
  showControls?: boolean;
}

export const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({
  height = 130,
  showControls = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const telemetry = useAppStore((s) => s.telemetry);
  const isPlayingStore = useAppStore((s) => s.isPlaying);
  const storeVolume = useAppStore((s) => s.volume);
  const appearance = useAppStore((s) => s.appearance);
  const setAppearance = useAppStore((s) => s.setAppearance);

  const isPlaying = isPlayingStore || telemetry.state === 'Playing';
  const volume = telemetry.volume ?? storeVolume ?? 1;

  // Render loop using requestAnimationFrame throttle for selected FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    const fps = appearance.spectrumFps || 60;
    const interval = 1000 / fps;

    const numBands = 32;
    const peaks = new Array(numBands).fill(0);
    const peakVelocity = new Array(numBands).fill(0);

    const render = (now: number) => {
      animId = requestAnimationFrame(render);
      const delta = now - lastTime;
      if (delta < interval) return;
      lastTime = now - (delta % interval);

      // Handle high DPI crisp canvas rendering
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      if (w === 0 || h === 0) return;

      const accent = appearance.accentColor || '#06b6d4';
      const timeSec = now / 1000;

      // Generate synthetic frequency amplitudes based on time and audio activity
      const bands = new Float32Array(numBands);
      for (let i = 0; i < numBands; i++) {
        if (isPlaying) {
          const freq = (i + 1) * 0.4;
          const val1 = Math.sin(timeSec * 6 + freq) * 0.4 + 0.5;
          const val2 = Math.cos(timeSec * 11 - freq * 1.5) * 0.3 + 0.5;
          const val3 = Math.sin(timeSec * 2.5 + i * 0.2) * 0.3;
          bands[i] = Math.min(1, Math.max(0.05, (val1 * 0.4 + val2 * 0.4 + val3 * 0.2) * volume));
        } else {
          // Idle low ambient pulse
          bands[i] = 0.04 + Math.sin(timeSec * 1.5 + i * 0.3) * 0.02;
        }

        // Gravity physics for peaks
        if (bands[i] > peaks[i]) {
          peaks[i] = bands[i];
          peakVelocity[i] = 0;
        } else {
          peakVelocity[i] += 0.003;
          peaks[i] = Math.max(bands[i], peaks[i] - peakVelocity[i]);
        }
      }

      const style = appearance.spectrumStyle || 'bars';

      switch (style) {
        case 'bars': {
          const barWidth = (w / numBands) * 0.75;
          const gap = (w / numBands) * 0.25;
          for (let i = 0; i < numBands; i++) {
            const barHeight = bands[i] * (h - 10);
            const x = i * (barWidth + gap) + gap / 2;
            const y = h - barHeight;

            // Bar Gradient
            const grad = ctx.createLinearGradient(0, h, 0, 0);
            grad.addColorStop(0, `${accent}33`);
            grad.addColorStop(0.7, accent);
            grad.addColorStop(1, '#ffffff');

            ctx.fillStyle = grad;
            ctx.shadowColor = accent;
            ctx.shadowBlur = appearance.neonGlow ? (appearance.neonIntensity / 100) * 12 : 0;
            ctx.fillRect(x, y, barWidth, barHeight);

            // Peak mark
            const peakY = h - peaks[i] * (h - 10);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, peakY - 2, barWidth, 2);
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
            const amp = bands[idx] * (h / 2.5);
            const waveY = centerY + Math.sin(x * 0.05 + timeSec * 12) * amp;
            ctx.lineTo(x, waveY);
          }
          ctx.stroke();
          break;
        }

        case 'circular': {
          const cx = w / 2;
          const cy = h / 2;
          const baseRadius = Math.min(w, h) * 0.28;

          for (let i = 0; i < numBands; i++) {
            const angle = (i / numBands) * Math.PI * 2;
            const barLen = bands[i] * (Math.min(w, h) * 0.25);

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
          ctx.strokeStyle = '#22d3ee';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 12;

          for (let i = 0; i < numBands; i++) {
            const t = (i / numBands) * Math.PI * 2;
            const r = bands[i] * (h / 2.2);
            const x = w / 2 + Math.cos(t * 3 + timeSec * 5) * (r + 10);
            const y = h / 2 + Math.sin(t * 5 + timeSec * 7) * (r + 10);

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

            const avgAmp =
              bands.reduce(
                (acc, b, idx) => (idx % 2 === channelIdx ? acc + b : acc),
                0
              ) / (numBands / 2);

            const activeSegs = Math.floor(avgAmp * totalSegments);
            const segW = (w - 120) / totalSegments;

            for (let s = 0; s < totalSegments; s++) {
              const segX = 110 + s * segW;
              const isLit = s < activeSegs;

              let color = '#22c55e'; // Green
              if (s > 16) color = '#f59e0b'; // Amber
              if (s > 21) color = '#ef4444'; // Red

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

          const pulseVal = bands.reduce((a, b) => a + b, 0) / numBands;

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
            const litRows = Math.floor(bands[i] * rows);
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
            const barH = bands[i] * (halfH - 5);
            const x = i * barWidth;

            ctx.fillStyle = accent;
            ctx.shadowColor = accent;
            ctx.shadowBlur = appearance.neonGlow ? 8 : 0;

            // Upper half
            ctx.fillRect(x + 1, halfH - barH, barWidth - 2, barH);
            // Lower half
            ctx.fillRect(x + 1, halfH, barWidth - 2, barH);
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
            const y = h - bands[i] * (h - 15);
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
            const barH = bands[i] * (h - 15);
            const y = h - barH;

            ctx.fillStyle = `${accent}bb`;
            ctx.fillRect(x, y, barWidth, barH);

            const peakY = h - peaks[i] * (h - 15);
            ctx.fillStyle = '#ef4444';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 8;
            ctx.fillRect(x, peakY - 3, barWidth, 3);
          }
          break;
        }
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, volume, appearance]);

  return (
    <div className="flex flex-col w-full gap-2">
      {showControls && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>SPECTRO REALTIME ({appearance.spectrumFps || 60} FPS)</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={appearance.spectrumStyle || 'bars'}
              onChange={(e) =>
                setAppearance({ spectrumStyle: e.target.value as SpectrumStyle })
              }
              className="bg-slate-950/80 text-cyan-300 border border-slate-700/60 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-cyan-500"
            >
              {SPECTRUM_STYLES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>

            <select
              value={appearance.spectrumFps || 60}
              onChange={(e) =>
                setAppearance({ spectrumFps: Number(e.target.value) as 30 | 60 | 120 })
              }
              className="bg-slate-950/80 text-cyan-300 border border-slate-700/60 rounded px-2 py-0.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value={30}>30 FPS</option>
              <option value={60}>60 FPS</option>
              <option value={120}>120 FPS</option>
            </select>
          </div>
        </div>
      )}

      <div
        className="w-full relative rounded-lg overflow-hidden border border-slate-800/80 bg-slate-950/90 shadow-inner"
        style={{ height }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
};
