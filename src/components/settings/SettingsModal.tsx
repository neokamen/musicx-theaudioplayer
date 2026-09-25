import React, { useState } from 'react';
import { useAppStore } from '../../store/index.ts';
import { translations } from '../../i18n/translations.ts';
import { SPECTRUM_STYLES, type SpectrumStyle } from '../widgets/SpectrumVisualizer.tsx';
import { RotateCcw, Trash2, Sliders, Disc } from 'lucide-react';

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
  const setListeningStats = useAppStore((s) => s.setListeningStats);
  const resetStats = useAppStore((s) => s.resetStats);
  const resetSettings = useAppStore((s) => s.resetSettings);
  const clearCacheAndResidues = useAppStore((s) => s.clearCacheAndResidues);
  const librarySettings = useAppStore((s) => s.librarySettings);
  const setLibrarySettings = useAppStore((s) => s.setLibrarySettings);
  const startDirectoryScan = useAppStore((s) => s.startDirectoryScan);
  const saveWindowSize = useAppStore((s) => s.saveWindowSize);
  const libraryTracks = useAppStore((s) => s.libraryTracks);

  const totalTracks = libraryTracks.length;
  const totalLibrarySeconds = libraryTracks.reduce((acc, t) => acc + (t.duration_seconds || 0), 0);
  const totalLibraryHours = (totalLibrarySeconds / 3600).toFixed(1);
  const listenedHours = ((listeningStats?.totalSecondsListened || 0) / 3600).toFixed(1);

  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'playback' | 'audio' | 'library' | 'about'>('general');
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  if (!isSettingsOpen) return null;

  const t = translations[language];

  const handleSaveWindow = async () => {
    await saveWindowSize();
    setSavedMessage(t.windowSizeSaved);
    setTimeout(() => setSavedMessage(null), 2500);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className="w-[780px] max-w-[94vw] h-[620px] max-h-[90vh] flex flex-col rounded-xl border border-slate-700/60 bg-slate-950/95 text-slate-100 shadow-2xl overflow-hidden"
        style={{
          boxShadow: appearance.neonGlow
            ? `0 0 35px ${appearance.accentColor}33`
            : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: appearance.accentColor }}
            />
            <h2 className="text-lg font-bold tracking-wide font-mono text-cyan-400">
              {t.settings} — musicx
            </h2>
          </div>

          <button
            onClick={() => setSettingsOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800 px-6 gap-2 bg-slate-900/40 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🌐 {t.general}
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎨 {t.appearance}
          </button>
          <button
            onClick={() => setActiveTab('playback')}
            className={`py-3 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'playback'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ▶️ Reproducción
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`py-3 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'audio'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎛️ {t.audio}
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`py-3 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'library'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎵 {t.library}
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-3.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'about'
                ? 'border-cyan-400 text-cyan-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            ℹ️ Acerca de
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Idioma sin iconos de banderas */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 block">
                  {t.language}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setLanguage('es')}
                    className={`py-2.5 px-4 rounded-lg border font-medium text-xs flex items-center justify-center transition ${
                      language === 'es'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-md font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    Castellano
                  </button>

                  <button
                    onClick={() => setLanguage('ca')}
                    className={`py-2.5 px-4 rounded-lg border font-medium text-xs flex items-center justify-center transition ${
                      language === 'ca'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-md font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    Català
                  </button>

                  <button
                    onClick={() => setLanguage('en')}
                    className={`py-2.5 px-4 rounded-lg border font-medium text-xs flex items-center justify-center transition ${
                      language === 'en'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-md font-bold'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Guardar Tamaño de Ventana */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">
                      {t.saveWindowSize}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Guarda el tamaño y posición actual del reproductor para próximos inicios.
                    </p>
                  </div>

                  <button
                    onClick={handleSaveWindow}
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition shadow-md"
                  >
                    {t.saveWindowSize}
                  </button>
                </div>
                {savedMessage && (
                  <p className="text-xs text-emerald-400 mt-2 font-mono">
                    ✓ {savedMessage}
                  </p>
                )}
              </div>

              {/* Botones de Mantenimiento del Sistema */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <h4 className="text-sm font-semibold text-slate-200">
                  Mantenimiento y Restauración
                </h4>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      resetSettings();
                      setSavedMessage("Ajustes restablecidos correctamente.");
                      setTimeout(() => setSavedMessage(null), 2500);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 font-medium text-xs transition flex items-center gap-2"
                  >
                    <RotateCcw size={13} />
                    Restablecer Ajustes Predeterminados
                  </button>

                  <button
                    onClick={() => {
                      clearCacheAndResidues();
                      setSavedMessage("Caché y archivos residuales eliminados.");
                      setTimeout(() => setSavedMessage(null), 2500);
                    }}
                    className="px-3.5 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-medium text-xs transition flex items-center gap-2"
                  >
                    <Trash2 size={13} />
                    Borrar Caché y Residuos
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Espectro Section */}
              <div className="space-y-3 p-4 rounded-lg bg-slate-900/60 border border-slate-800">
                <h4 className="text-sm font-semibold text-cyan-400 font-mono">
                  📊 {t.spectrumVisualizer}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      {t.spectrumStyle}
                    </label>
                    <select
                      value={appearance.spectrumStyle || 'bars'}
                      onChange={(e) =>
                        setAppearance({
                          spectrumStyle: e.target.value as SpectrumStyle,
                        })
                      }
                      className="w-full bg-slate-950 text-cyan-300 border border-slate-700 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      {SPECTRUM_STYLES.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">
                      {t.spectrumFps}
                    </label>
                    <select
                      value={appearance.spectrumFps || 60}
                      onChange={(e) =>
                        setAppearance({
                          spectrumFps: Number(e.target.value) as 30 | 60 | 120,
                        })
                      }
                      className="w-full bg-slate-950 text-cyan-300 border border-slate-700 rounded px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value={30}>30 FPS (Bajo consumo)</option>
                      <option value={60}>60 FPS (Ultra fluido)</option>
                      <option value={120}>120 FPS (Máxima tasa)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Accent Color */}
              <div className="space-y-3 pt-2">
                <label className="text-sm font-semibold text-slate-300 block">
                  {t.accentColor}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {accentPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      onClick={() =>
                        setAppearance({
                          accentColor: preset.hex,
                          accentPreset: preset.hex,
                        })
                      }
                      className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center gap-2 hover:border-slate-700 transition"
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="text-xs text-slate-300 truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <span className="text-xs text-slate-400">{t.customColor}:</span>
                  <input
                    type="color"
                    value={appearance.accentColor}
                    onChange={(e) =>
                      setAppearance({
                        accentColor: e.target.value,
                        accentPreset: 'custom',
                      })
                    }
                    className="w-9 h-9 rounded cursor-pointer border border-slate-700 bg-transparent"
                  />
                  <span className="text-xs font-mono text-cyan-400">
                    {appearance.accentColor}
                  </span>
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <label className="text-sm font-semibold text-slate-300 block">
                  {t.backgroundColor}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {bgPresets.map((preset) => (
                    <button
                      key={preset.hex}
                      onClick={() =>
                        setAppearance({
                          bgColor: preset.hex,
                          bgPreset: preset.hex,
                        })
                      }
                      className="p-2 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center gap-2 hover:border-slate-700 transition"
                    >
                      <span
                        className="w-4 h-4 rounded border border-white/20"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="text-xs text-slate-300">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-slate-400">{t.customColor}:</span>
                  <input
                    type="color"
                    value={appearance.bgColor}
                    onChange={(e) =>
                      setAppearance({
                        bgColor: e.target.value,
                        bgPreset: 'custom',
                      })
                    }
                    className="w-9 h-9 rounded cursor-pointer border border-slate-700 bg-transparent"
                  />
                  <span className="text-xs font-mono text-slate-300">
                    {appearance.bgColor}
                  </span>
                </div>
              </div>

              {/* Glassmorphism & Neon Glow Sliders */}
              <div className="space-y-4 pt-4 border-t border-slate-800">
                {/* Glassmorphism */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      {t.glassmorphism}
                    </label>
                    <input
                      type="checkbox"
                      checked={appearance.glassmorphism}
                      onChange={(e) =>
                        setAppearance({ glassmorphism: e.target.checked })
                      }
                      className="accent-cyan-500 w-4 h-4 cursor-pointer"
                    />
                  </div>
                  {appearance.glassmorphism && (
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400 w-24">
                        {t.blurAmount}:
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        value={appearance.glassBlur}
                        onChange={(e) =>
                          setAppearance({ glassBlur: Number(e.target.value) })
                        }
                        className="flex-1 accent-cyan-400"
                      />
                      <span className="text-xs font-mono text-cyan-400 w-8">
                        {appearance.glassBlur}px
                      </span>
                    </div>
                  )}
                </div>

                {/* Neon Glow */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      {t.neonGlow}
                    </label>
                    <input
                      type="checkbox"
                      checked={appearance.neonGlow}
                      onChange={(e) =>
                        setAppearance({ neonGlow: e.target.checked })
                      }
                      className="accent-cyan-500 w-4 h-4 cursor-pointer"
                    />
                  </div>
                  {appearance.neonGlow && (
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400 w-24">
                        {t.glowIntensity}:
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={appearance.neonIntensity}
                        onChange={(e) =>
                          setAppearance({ neonIntensity: Number(e.target.value) })
                        }
                        className="flex-1 accent-cyan-400"
                      />
                      <span className="text-xs font-mono text-cyan-400 w-8">
                        {appearance.neonIntensity}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Border Effect Sliders */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      {t.borderEffect}
                    </label>
                    <input
                      type="checkbox"
                      checked={appearance.borderEffect}
                      onChange={(e) =>
                        setAppearance({ borderEffect: e.target.checked })
                      }
                      className="accent-cyan-500 w-4 h-4 cursor-pointer"
                    />
                  </div>
                  {appearance.borderEffect && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 w-28">
                          {t.borderRadius}:
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          value={appearance.borderRadius}
                          onChange={(e) =>
                            setAppearance({ borderRadius: Number(e.target.value) })
                          }
                          className="flex-1 accent-cyan-400"
                        />
                        <span className="text-xs font-mono text-cyan-400 w-8">
                          {appearance.borderRadius}px
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400 w-28">
                          {t.borderOpacity}:
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={appearance.borderOpacity}
                          onChange={(e) =>
                            setAppearance({ borderOpacity: Number(e.target.value) })
                          }
                          className="flex-1 accent-cyan-400"
                        />
                        <span className="text-xs font-mono text-cyan-400 w-8">
                          {appearance.borderOpacity}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PLAYBACK TAB */}
          {activeTab === 'playback' && (
            <div className="space-y-6">
              {/* Estilo de Barra de Reproducción */}
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
                <h4 className="text-sm font-semibold text-cyan-400 font-mono flex items-center gap-2">
                  <Sliders size={14} />
                  Estilo de Barra de Reproducción
                </h4>
                <p className="text-xs text-slate-400">
                  Elige cómo se renderiza la barra central de progreso y visualización de onda.
                </p>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <button
                    onClick={() => setPlaybackSettings({ playerBarStyle: 'classic' })}
                    className={`p-3 rounded-lg border text-left transition flex flex-col gap-1 ${
                      (playbackSettings?.playerBarStyle || 'hybrid') === 'classic'
                        ? 'border-cyan-500 bg-cyan-950/40 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-cyan-300">Clásico Hi-Fi</span>
                    <span className="text-[10px] text-slate-400">Barra de progreso fina tradicional</span>
                  </button>

                  <button
                    onClick={() => setPlaybackSettings({ playerBarStyle: 'spectrum' })}
                    className={`p-3 rounded-lg border text-left transition flex flex-col gap-1 ${
                      playbackSettings?.playerBarStyle === 'spectrum'
                        ? 'border-cyan-500 bg-cyan-950/40 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-cyan-300">Espectro Onda</span>
                    <span className="text-[10px] text-slate-400">Visualizador reactivo en la barra</span>
                  </button>

                  <button
                    onClick={() => setPlaybackSettings({ playerBarStyle: 'hybrid' })}
                    className={`p-3 rounded-lg border text-left transition flex flex-col gap-1 ${
                      playbackSettings?.playerBarStyle === 'hybrid'
                        ? 'border-cyan-500 bg-cyan-950/40 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold text-cyan-300">Híbrido (Recomendado)</span>
                    <span className="text-[10px] text-slate-400">Barra de tiempo con mini-espectro</span>
                  </button>
                </div>
              </div>

              {/* Difuminar carátula en la lista de canciones */}
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Disc size={14} className="text-cyan-400" />
                      Difuminar Carátula en Lista de Biblioteca
                    </h4>
                    <p className="text-xs text-slate-400">
                      Muestra la portada del álbum en reproducción de fondo con desenfoque ambiental.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={playbackSettings?.diffuseAlbumArt ?? true}
                    onChange={(e) =>
                      setPlaybackSettings({ diffuseAlbumArt: e.target.checked })
                    }
                    className="accent-cyan-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {playbackSettings?.diffuseAlbumArt && (
                  <div className="pt-2 flex items-center gap-4">
                    <span className="text-xs text-slate-400 w-32">
                      Opacidad / Transparencia:
                    </span>
                    <input
                      type="range"
                      min="5"
                      max="80"
                      value={playbackSettings?.diffuseAlbumArtOpacity ?? 25}
                      onChange={(e) =>
                        setPlaybackSettings({ diffuseAlbumArtOpacity: Number(e.target.value) })
                      }
                      className="flex-1 accent-cyan-400"
                    />
                    <span className="text-xs font-mono text-cyan-400 w-10">
                      {playbackSettings?.diffuseAlbumArtOpacity ?? 25}%
                    </span>
                  </div>
                )}
              </div>

              {/* Ajustes avanzados de reproducción gapless & drop */}
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Gapless Playback (Transición perfecta sin pausas entre pistas)
                  </span>
                  <input
                    type="checkbox"
                    checked={playbackSettings?.gaplessPlayback ?? true}
                    onChange={(e) =>
                      setPlaybackSettings({ gaplessPlayback: e.target.checked })
                    }
                    className="accent-cyan-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
                  <span className="text-xs font-semibold text-slate-300">
                    Auto-reproducir inmediatamente al soltar pistas (Drag & Drop)
                  </span>
                  <input
                    type="checkbox"
                    checked={playbackSettings?.autoPlayOnDrop ?? true}
                    onChange={(e) =>
                      setPlaybackSettings({ autoPlayOnDrop: e.target.checked })
                    }
                    className="accent-cyan-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* AUDIO TAB */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Extra Volume Gain Boost */}
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">
                    🔊 {t.extraVolumeGain}
                  </span>
                  <input
                    type="checkbox"
                    checked={audioSettings.allowExtraVolumeBoost}
                    onChange={(e) =>
                      setAudioSettings({
                        allowExtraVolumeBoost: e.target.checked,
                      })
                    }
                    className="accent-cyan-500 w-4 h-4 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  {t.extraVolumeGainDesc}
                </p>
              </div>

              {/* Resampling & Buffer Settings */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {t.resamplingQuality}
                  </label>
                  <select
                    value={audioSettings.resamplingQuality}
                    onChange={(e) =>
                      setAudioSettings({
                        resamplingQuality: e.target.value as "bit_perfect" | "symphonia_96k" | "float32",
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="bit_perfect">
                      ALSA Bit-Perfect (Direct Exclusive Raw PCM - Recomendado)
                    </option>
                    <option value="symphonia_96k">
                      Symphonia High-Precision Resampler (96kHz / 24-bit)
                    </option>
                    <option value="float32">
                      Audiophile IEEE-Float 32-bit Internal Engine
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {t.bufferLatency}
                  </label>
                  <select
                    value={audioSettings.bufferLatency}
                    onChange={(e) =>
                      setAudioSettings({
                        bufferLatency: e.target.value as "ultra_low" | "low" | "stable",
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="ultra_low">
                      Ultra-Low Latency (5ms / 256 muestras - Direct Hardware)
                    </option>
                    <option value="low">
                      Low Latency (10ms / 512 muestras - Balanceado)
                    </option>
                    <option value="stable">
                      Alta Estabilidad (40ms / 2048 muestras - Carga Reducida)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    {t.ditherEngine}
                  </label>
                  <select
                    value={audioSettings.ditherEngine}
                    onChange={(e) =>
                      setAudioSettings({
                        ditherEngine: e.target.value as "tpdf" | "none",
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="tpdf">
                      Triangular Dither TPDF (Reducción de ruido de cuantización)
                    </option>
                    <option value="none">
                      Desactivado (Passthrough 24/32-bit directo)
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* LIBRARY TAB */}
          {activeTab === 'library' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 block">
                  {t.musicFolder}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={librarySettings.musicFolder}
                    onChange={(e) =>
                      setLibrarySettings({ musicFolder: e.target.value })
                    }
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    onClick={() => startDirectoryScan(librarySettings.musicFolder, true)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-sm font-medium transition"
                  >
                    {t.syncLibrary}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">
                    {t.autoScanStartup}
                  </span>
                  <input
                    type="checkbox"
                    checked={librarySettings.autoScanOnStartup}
                    onChange={(e) =>
                      setLibrarySettings({ autoScanOnStartup: e.target.checked })
                    }
                    className="accent-cyan-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* Estadísticas Nerd de la Biblioteca */}
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 font-mono">
                  <div className="text-xs uppercase text-cyan-400 font-bold tracking-wider flex items-center justify-between">
                    <span>Telemetría Nerd de Biblioteca</span>
                    <button
                      onClick={resetStats}
                      className="text-[10px] text-rose-400 hover:text-rose-300 underline font-normal"
                    >
                      Reiniciar Estadísticas
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Total de Canciones</span>
                      <span className="text-base font-bold text-white">{totalTracks}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Horas en Biblioteca</span>
                      <span className="text-base font-bold text-emerald-400">{totalLibraryHours} h</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Horas de Música Escuchada</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <input
                          type="number"
                          step="0.1"
                          value={listenedHours}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            setListeningStats({ totalSecondsListened: Math.round(val * 3600) });
                          }}
                          className="w-16 bg-slate-900 border border-slate-700 rounded px-1 text-cyan-300 font-bold text-xs"
                        />
                        <span className="text-slate-400 text-xs">horas</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Sesiones de Escucha</span>
                      <span className="text-base font-bold text-amber-400">{listeningStats?.totalSessions ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="space-y-5 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-slate-950 text-sm"
                    style={{ backgroundColor: appearance.accentColor || '#06b6d4' }}
                  >
                    MX
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">musicx — the audio player</h3>
                    <p className="text-[11px] text-slate-400">Versión 2.4.0 (Hi-Fi Master Edition)</p>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed font-sans text-xs">
                  Reproductor de audio audiófilo de ultra alto rendimiento diseñado con arquitectura
                  de <strong>Ventanas Modular</strong> desacopladas, motor nativo en Rust con Symphonia y CPAL,
                  salida directa ALSA Bit-Perfect sin remuestreo y visualizador FFT en tiempo real a 60+ FPS.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase text-[9px]">Motor de Sonido</span>
                  <div className="text-slate-200 font-bold">Rust CPAL (Direct Raw ALSA)</div>
                  <div className="text-[10px] text-slate-400">64-bit IEEE Float Audio Pipeline</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase text-[9px]">Procesamiento DSP</span>
                  <div className="text-slate-200 font-bold">Linear 10-Band EQ & XDSS</div>
                  <div className="text-[10px] text-slate-400">Soundix True-Peak Normalizer (-0.1 dBTP)</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase text-[9px]">Frontend UI</span>
                  <div className="text-slate-200 font-bold">React 19 + Tailwind CSS</div>
                  <div className="text-[10px] text-slate-400">Virtualizer de 60+ FPS para 50k+ pistas</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 space-y-1">
                  <span className="text-slate-500 uppercase text-[9px]">Arquitectura</span>
                  <div className="text-slate-200 font-bold">Ventanas Modular</div>
                  <div className="text-[10px] text-slate-400">Paneles independientes reconfigurables</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex justify-end shrink-0">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-md transition"
          >
            Guardar & Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
