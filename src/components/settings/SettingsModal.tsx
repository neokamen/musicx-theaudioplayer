import React, { useState } from 'react';
import { useAppStore } from '../../store/index.ts';
import { translations, type Language } from '../../i18n/translations.ts';
import { SPECTRUM_STYLES, type SpectrumStyle } from '../widgets/SpectrumVisualizer.tsx';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useAppStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const appearance = useAppStore((s) => s.appearance);
  const setAppearance = useAppStore((s) => s.setAppearance);
  const audioSettings = useAppStore((s) => s.audioSettings);
  const setAudioSettings = useAppStore((s) => s.setAudioSettings);
  const playbackSettings = useAppStore((s) => s.playbackSettings);
  const setPlaybackSettings = useAppStore((s) => s.setPlaybackSettings);
  const listeningStats = useAppStore((s) => s.listeningStats);
  const resetStats = useAppStore((s) => s.resetStats);
  const resetSettings = useAppStore((s) => s.resetSettings);
  const clearCacheAndResidues = useAppStore((s) => s.clearCacheAndResidues);
  const librarySettings = useAppStore((s) => s.librarySettings);
  const setLibrarySettings = useAppStore((s) => s.setLibrarySettings);
  const startDirectoryScan = useAppStore((s) => s.startDirectoryScan);
  const saveWindowSize = useAppStore((s) => s.saveWindowSize);
  const totalTracks = useAppStore((s) => s.libraryTracks.length);

  type TabId = 'general' | 'appearance' | 'audio' | 'playback' | 'library' | 'about';
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isSettingsOpen) return null;

  const t = translations[language];

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSaveWindow = async () => {
    await saveWindowSize();
    showStatus(t.windowSizeSaved);
  };

  const handleResetSettings = () => {
    if (window.confirm(t.resetSettingsConfirm)) {
      resetSettings();
      showStatus(t.settingsReset);
    }
  };

  const handleClearCache = () => {
    clearCacheAndResidues();
    showStatus(t.cacheCleared);
  };

  const handleResetStats = () => {
    resetStats();
    showStatus(t.statsReset);
  };

  const accentPresets = [
    { name: 'Cian Neón (Predeterminado)', hex: '#06b6d4' },
    { name: 'Esmeralda Hi-Fi', hex: '#10b981' },
    { name: 'Violeta Eléctrico', hex: '#8b5cf6' },
    { name: 'Rosa Neón', hex: '#ec4899' },
    { name: 'Ámbar Cálido', hex: '#f59e0b' },
    { name: 'Azul Espacial', hex: '#3b82f6' },
  ];

  const bgPresets = [
    { name: 'Obsidiana Dark (Predeterminado)', hex: '#090d16' },
    { name: 'Espacio Profundo', hex: '#050811' },
    { name: 'Negro Puro OLED', hex: '#000000' },
    { name: 'Grafito Técnico', hex: '#111827' },
  ];

  const languages: { code: Language; label: string }[] = [
    { code: 'es', label: 'Castellano' },
    { code: 'ca', label: 'Català' },
    { code: 'en', label: 'English' },
  ];

  const hoursListenedCalculated = (
    (listeningStats.totalSecondsListened / 3600) +
    (librarySettings.totalHoursOverride || 0)
  ).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className="w-[820px] max-w-[95vw] h-[640px] flex flex-col rounded-xl border border-slate-700/60 bg-slate-950 text-slate-100 shadow-2xl overflow-hidden"
        style={{
          boxShadow: appearance.neonGlow
            ? `0 0 35px ${appearance.accentColor}33`
            : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: appearance.accentColor,
                boxShadow: appearance.neonGlow ? `0 0 10px ${appearance.accentColor}` : 'none',
              }}
            />
            <h2
              className="text-base font-bold tracking-wide font-mono uppercase"
              style={{ color: appearance.accentColor }}
            >
              {t.settings} &bull; musicx
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {statusMessage && (
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded">
                ✓ {statusMessage}
              </span>
            )}
            <button
              onClick={() => setSettingsOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 px-6 gap-1 bg-slate-900/40 shrink-0 overflow-x-auto">
          {[
            { id: 'general', label: t.general },
            { id: 'appearance', label: t.appearance },
            { id: 'audio', label: t.audio },
            { id: 'playback', label: t.playback },
            { id: 'library', label: t.library },
            { id: 'about', label: t.about },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`py-3 px-4 text-xs font-mono font-bold uppercase transition border-b-2 ${
                  isActive
                    ? 'border-cyan-400 text-cyan-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                style={{
                  borderColor: isActive ? appearance.accentColor : 'transparent',
                  color: isActive ? appearance.accentColor : undefined,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body - Fixed scrollable container */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6 text-sm">
          {/* ================= GENERAL TAB ================= */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Language Selector without Flag Emojis */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  {t.language}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`py-2.5 px-4 rounded-lg font-mono text-xs font-bold transition border ${
                        language === l.code
                          ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-md'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                      style={{
                        borderColor: language === l.code ? appearance.accentColor : undefined,
                        color: language === l.code ? appearance.accentColor : undefined,
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Window & Layout persistence */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  {t.saveWindowSize}
                </label>
                <button
                  onClick={handleSaveWindow}
                  className="px-4 py-2.5 rounded-lg font-mono text-xs font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 transition"
                  style={{
                    boxShadow: appearance.neonGlow ? `0 0 10px ${appearance.accentColor}22` : undefined,
                  }}
                >
                  💾 {t.saveWindowSize}
                </button>
              </div>

              {/* Reset & Maintenance */}
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Mantenimiento y Reseteo
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleResetSettings}
                    className="px-4 py-2.5 rounded-lg font-mono text-xs font-bold bg-amber-950/30 hover:bg-amber-900/40 border border-amber-800/60 text-amber-300 transition"
                  >
                    ↺ {t.resetSettings}
                  </button>

                  <button
                    onClick={handleClearCache}
                    className="px-4 py-2.5 rounded-lg font-mono text-xs font-bold bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/60 text-rose-300 transition"
                  >
                    🗑 {t.clearCache}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= APPEARANCE TAB ================= */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Spectrum Visualizer Settings */}
              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-4">
                <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                  <span>📊</span> {t.spectrumVisualizer}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-slate-400 mb-2 block">
                      {t.spectrumStyle}
                    </label>
                    <select
                      value={appearance.spectrumStyle}
                      onChange={(e) =>
                        setAppearance({ spectrumStyle: e.target.value as SpectrumStyle })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                    >
                      {SPECTRUM_STYLES.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-mono text-slate-400 mb-2 block">
                      {t.spectrumFps}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[30, 60, 120].map((fps) => (
                        <button
                          key={fps}
                          onClick={() => setAppearance({ spectrumFps: fps as 30 | 60 | 120 })}
                          className={`py-2 text-xs font-mono font-bold rounded-lg border transition ${
                            appearance.spectrumFps === fps
                              ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          {fps} FPS
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  {t.accentColor}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {accentPresets.map((p) => (
                    <button
                      key={p.hex}
                      onClick={() => setAppearance({ accentColor: p.hex, accentPreset: p.hex })}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border transition ${
                        appearance.accentColor === p.hex
                          ? 'border-white bg-slate-800'
                          : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full shadow-sm shrink-0"
                        style={{ backgroundColor: p.hex }}
                      />
                      <span className="text-xs font-mono truncate text-slate-300">{p.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="text-xs font-mono text-slate-400">{t.customColor}:</label>
                  <input
                    type="color"
                    value={appearance.accentColor}
                    onChange={(e) =>
                      setAppearance({ accentColor: e.target.value, accentPreset: 'custom' })
                    }
                    className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-400">{appearance.accentColor}</span>
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-3 pt-3 border-t border-slate-800/80">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  {t.backgroundColor}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {bgPresets.map((p) => (
                    <button
                      key={p.hex}
                      onClick={() => setAppearance({ bgColor: p.hex, bgPreset: p.hex })}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border transition ${
                        appearance.bgColor === p.hex
                          ? 'border-white bg-slate-800'
                          : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-slate-700 shrink-0"
                        style={{ backgroundColor: p.hex }}
                      />
                      <span className="text-xs font-mono truncate text-slate-300">{p.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="text-xs font-mono text-slate-400">{t.customColor}:</label>
                  <input
                    type="color"
                    value={appearance.bgColor}
                    onChange={(e) =>
                      setAppearance({ bgColor: e.target.value, bgPreset: 'custom' })
                    }
                    className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-400">{appearance.bgColor}</span>
                </div>
              </div>

              {/* Glassmorphism & Neon Glow Controls */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {t.glassmorphism}
                    </span>
                    <input
                      type="checkbox"
                      checked={appearance.glassmorphism}
                      onChange={(e) => setAppearance({ glassmorphism: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                    />
                  </div>
                  {appearance.glassmorphism && (
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>{t.blurAmount}</span>
                        <span>{appearance.glassBlur}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="30"
                        value={appearance.glassBlur}
                        onChange={(e) => setAppearance({ glassBlur: Number(e.target.value) })}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300">{t.neonGlow}</span>
                    <input
                      type="checkbox"
                      checked={appearance.neonGlow}
                      onChange={(e) => setAppearance({ neonGlow: e.target.checked })}
                      className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                    />
                  </div>
                  {appearance.neonGlow && (
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>{t.glowIntensity}</span>
                        <span>{appearance.neonIntensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={appearance.neonIntensity}
                        onChange={(e) =>
                          setAppearance({ neonIntensity: Number(e.target.value) })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Borders */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300">{t.borderEffect}</span>
                  <input
                    type="checkbox"
                    checked={appearance.borderEffect}
                    onChange={(e) => setAppearance({ borderEffect: e.target.checked })}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>
                {appearance.borderEffect && (
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>{t.borderOpacity}</span>
                        <span>{appearance.borderOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={appearance.borderOpacity}
                        onChange={(e) =>
                          setAppearance({ borderOpacity: Number(e.target.value) })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>{t.borderRadius}</span>
                        <span>{appearance.borderRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        value={appearance.borderRadius}
                        onChange={(e) =>
                          setAppearance({ borderRadius: Number(e.target.value) })
                        }
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= AUDIO TAB ================= */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              {/* Extra Volume Gain Boost (+25%) */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-cyan-300">
                      {t.extraVolumeGain}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t.extraVolumeGainDesc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioSettings.allowExtraVolumeBoost}
                    onChange={(e) =>
                      setAudioSettings({ allowExtraVolumeBoost: e.target.checked })
                    }
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Dynamic XDSS Punch */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-amber-300">
                      ⚡ {t.xdssDynamicPunch}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t.xdssDynamicPunchDesc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioSettings.isXdssEnabled}
                    onChange={(e) => setAudioSettings({ isXdssEnabled: e.target.checked })}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Tube Warmth Saturation */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-orange-300">
                      📻 {t.tubeWarmth}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t.tubeWarmthDesc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioSettings.tubeWarmth}
                    onChange={(e) => setAudioSettings({ tubeWarmth: e.target.checked })}
                    className="w-4 h-4 accent-orange-400 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Soundix Normalizer / Peak Limiter */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-emerald-300">
                      🎚 {t.soundixNormalizer}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{t.soundixNormalizerDesc}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioSettings.isNormalizerEnabled}
                    onChange={(e) => setAudioSettings({ isNormalizerEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-400 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Resampling Quality & Buffer Latency */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 font-bold block">
                    {t.resamplingQuality}
                  </label>
                  <select
                    value={audioSettings.resamplingQuality}
                    onChange={(e) =>
                      setAudioSettings({
                        resamplingQuality: e.target.value as "bit_perfect" | "symphonia_96k" | "float32",
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                  >
                    <option value="bit_perfect">ALSA Direct Bit-Perfect (Nativo)</option>
                    <option value="symphonia_96k">Symphonia High-Res 96 kHz Sinc</option>
                    <option value="float32">Float32 64-bit Ultra-linear</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono text-slate-400 font-bold block">
                    {t.bufferLatency}
                  </label>
                  <select
                    value={audioSettings.bufferLatency}
                    onChange={(e) =>
                      setAudioSettings({
                        bufferLatency: e.target.value as "ultra_low" | "low" | "stable",
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                  >
                    <option value="ultra_low">Ultra-Low (~5 ms Direct ALSA)</option>
                    <option value="low">Low (~15 ms PipeWire Native)</option>
                    <option value="stable">Stable Safe (~40 ms Buffered)</option>
                  </select>
                </div>
              </div>

              {/* Dither Engine */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 font-bold block">
                  {t.ditherEngine}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'tpdf', name: 'TPDF Triangular Dither (Audiophile)' },
                    { id: 'none', name: 'Truncated 0-Dither Direct' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setAudioSettings({ ditherEngine: d.id as "tpdf" | "none" })}
                      className={`p-2.5 rounded-lg font-mono text-xs font-bold border transition ${
                        audioSettings.ditherEngine === d.id
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= PLAYBACK TAB ================= */}
          {activeTab === 'playback' && (
            <div className="space-y-5">
              {/* Gapless Playback */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-200">
                      {t.gaplessPlayback}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Transición inmediata entre pistas sin huecos de silencio en directos u óperas.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={playbackSettings.gaplessPlayback}
                    onChange={(e) =>
                      setPlaybackSettings({ gaplessPlayback: e.target.checked })
                    }
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Auto-Play on Drop */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-200">
                      {t.autoPlayOnDrop}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Al arrastrar pistas o carpetas sobre la aplicación, se encolan e inician de inmediato.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={playbackSettings.autoPlayOnDrop}
                    onChange={(e) =>
                      setPlaybackSettings({ autoPlayOnDrop: e.target.checked })
                    }
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Crossfade */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span className="font-bold">{t.crossfadeDuration}</span>
                  <span className="text-cyan-400 font-bold">
                    {playbackSettings.crossfadeDurationSec}s
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={playbackSettings.crossfadeDurationSec}
                  onChange={(e) =>
                    setPlaybackSettings({ crossfadeDurationSec: Number(e.target.value) })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* ReplayGain Mode */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-slate-400 font-bold block">
                  {t.replayGainMode}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'track', label: 'Por Pista (Track)' },
                    { id: 'album', label: 'Por Álbum (Album)' },
                    { id: 'off', label: 'Desactivado (Off)' },
                  ].map((rg) => (
                    <button
                      key={rg.id}
                      onClick={() =>
                        setPlaybackSettings({ replayGainMode: rg.id as 'track' | 'album' | 'off' })
                      }
                      className={`p-2.5 rounded-lg font-mono text-xs font-bold border transition ${
                        playbackSettings.replayGainMode === rg.id
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'
                      }`}
                    >
                      {rg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= LIBRARY TAB ================= */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              {/* Folder Selector */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  {t.musicFolder}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={librarySettings.musicFolder}
                    onChange={(e) =>
                      setLibrarySettings({ musicFolder: e.target.value })
                    }
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                  />
                  <button
                    onClick={() => startDirectoryScan(librarySettings.musicFolder, true)}
                    className="px-4 py-2 rounded-lg font-mono text-xs font-bold bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700 text-cyan-300 transition"
                  >
                    🔄 {t.scanLibraryNow}
                  </button>
                </div>
              </div>

              {/* Auto Scan Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-900/40">
                <span className="text-xs font-mono text-slate-300">{t.autoScanStartup}</span>
                <input
                  type="checkbox"
                  checked={librarySettings.autoScanOnStartup}
                  onChange={(e) =>
                    setLibrarySettings({ autoScanOnStartup: e.target.checked })
                  }
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </div>

              {/* Nerd Metrics & Stats Section */}
              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-2">
                    <span>📈</span> {t.statsSection}
                  </h3>
                  <button
                    onClick={handleResetStats}
                    className="text-[11px] font-mono text-rose-400 hover:text-rose-300 hover:underline"
                  >
                    ↺ {t.resetStats}
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      {t.totalTracks}
                    </span>
                    <span className="text-lg font-mono font-bold text-cyan-400 mt-1 block">
                      {totalTracks}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      {t.totalTracksPlayed}
                    </span>
                    <span className="text-lg font-mono font-bold text-emerald-400 mt-1 block">
                      {listeningStats.totalTracksPlayed}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      {t.totalHoursListened}
                    </span>
                    <span className="text-lg font-mono font-bold text-amber-400 mt-1 block">
                      {hoursListenedCalculated} h
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      {t.totalSessions}
                    </span>
                    <span className="text-lg font-mono font-bold text-violet-400 mt-1 block">
                      {listeningStats.totalSessions}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= ABOUT TAB ================= */}
          {activeTab === 'about' && (
            <div className="space-y-5">
              <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/40 flex items-center gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-mono font-black text-2xl border shadow-lg shrink-0"
                  style={{
                    backgroundColor: `${appearance.accentColor}20`,
                    borderColor: appearance.accentColor,
                    color: appearance.accentColor,
                    boxShadow: appearance.neonGlow ? `0 0 20px ${appearance.accentColor}40` : undefined,
                  }}
                >
                  mX
                </div>
                <div>
                  <h3 className="text-base font-bold font-mono tracking-wider text-slate-100">
                    musicx &bull; The Audio Player
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    v0.1.0 (Hi-Fi Bit-Perfect Edition &bull; Linux Native)
                  </p>
                  <p className="text-xs text-slate-300 mt-2">{t.aboutDesc}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
                    <span>🪟</span> Ventanas Modulares
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.aboutArchitecture}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-2">
                    <span>🦀</span> Bit-Perfect Rust Engine
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.aboutEngine}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950 font-mono text-[11px] text-slate-400 flex justify-between items-center">
                <span>Stack: Tauri v2 &bull; React 19 &bull; Symphonia &bull; ALSA / PipeWire</span>
                <span className="text-cyan-400 font-bold">Bit-Perfect 192kHz/32bit Capable</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
