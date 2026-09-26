import React, { useRef, useState } from 'react';
import { useMusicStore } from '../../store/index.ts';
import { translations } from '../../i18n/translations.ts';
import {
  RotateCcw,
  Trash2,
  Sliders,
  Sparkles,
  Palette,
  Activity,
  Music,
  Info,
  Check,
  Plus,
  Clock,
  Volume2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
} from 'lucide-react';
import { SPECTRUM_STYLES } from '../widgets/SpectrumVisualizer.tsx';
import {
  ACCENT_OPTIONS,
  THEME_OPTIONS,
  getSavedAccent,
  getSavedTheme,
  getCustomAccentColor,
  setCustomAccentColor,
  getCustomThemeColor,
  setCustomThemeColor,
  getSavedBgOpacity,
  getSavedNeonGlow,
  getSavedNeonGlowIntensity,
  getSavedTintedBorders,
  getSavedTintedBordersRatio,
  getSavedCornerRadius,
  getSavedAmbientGlow,
  getSavedMinimalScrollbars,
  applyTheme,
  type AccentColor,
  type BackgroundTheme,
  type CornerRadius,
} from '../../lib/theme.ts';

type SettingsTab = 'general' | 'appearance' | 'cava' | 'playback' | 'audio' | 'library' | 'about';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setSettingsOpen,
    language,
    setLanguage,
    appearance,
    setAppearance,
    audioSettings,
    setAudioSettings,
    playbackSettings,
    setPlaybackSettings,
    listeningStats,
    resetStats,
    resetSettings,
    clearCacheAndResidues,
    librarySettings,
    setLibrarySettings,
    startDirectoryScan,
    saveWindowSize,
    libraryTracks,
  } = useMusicStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const tabsRef = useRef<HTMLDivElement>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const [accent, setAccent] = useState<AccentColor>(getSavedAccent);
  const [bgTheme, setBgTheme] = useState<BackgroundTheme>(getSavedTheme);
  const [customAccentHex, setCustomAccentHexState] = useState<string>(getCustomAccentColor);
  const [customThemeHex, setCustomThemeHexState] = useState<string>(getCustomThemeColor);
  const [bgOpacity, setBgOpacity] = useState<number>(getSavedBgOpacity);
  const [neonGlow, setNeonGlow] = useState<boolean>(getSavedNeonGlow);
  const [neonIntensity, setNeonIntensity] = useState<number>(getSavedNeonGlowIntensity);
  const [tintedBorders, setTintedBorders] = useState<boolean>(getSavedTintedBorders);
  const [tintedBordersRatio, setTintedBordersRatio] = useState<number>(getSavedTintedBordersRatio);
  const [cornerRadius, setCornerRadius] = useState<CornerRadius>(getSavedCornerRadius);
  const [ambientGlow, setAmbientGlow] = useState<boolean>(getSavedAmbientGlow);
  const [minimalScrollbars, setMinimalScrollbars] = useState<boolean>(getSavedMinimalScrollbars);

  const statsBackupInputRef = useRef<HTMLInputElement>(null);

  if (!isSettingsOpen) return null;

  const t = translations[language] || translations.es;

  const totalTracks = libraryTracks.length;
  const totalLibrarySeconds = libraryTracks.reduce((acc, trk) => acc + (trk.duration_seconds || 0), 0);
  const totalLibraryHours = (totalLibrarySeconds / 3600).toFixed(1);

  const listenedHours = Math.floor(listeningStats.totalSecondsListened / 3600);
  const listenedMinutes = Math.floor((listeningStats.totalSecondsListened % 3600) / 60);

  const triggerApplyTheme = (
    newAccent = accent,
    newBg = bgTheme,
    newCustomAccent = customAccentHex,
    newCustomTheme = customThemeHex,
    newOpacity = bgOpacity,
    newGlow = neonGlow,
    newIntensity = neonIntensity,
    newTinted = tintedBorders,
    newTintedRatio = tintedBordersRatio,
    newRadius = cornerRadius,
    newAmbient = ambientGlow,
    newScrollbars = minimalScrollbars,
  ) => {
    applyTheme(
      newAccent,
      newBg,
      newCustomAccent,
      newCustomTheme,
      newOpacity,
      newGlow,
      newIntensity,
      newTinted,
      newTintedRatio,
      newRadius,
      newAmbient,
      newScrollbars,
    );
  };

  const handleSelectAccent = (newAccent: AccentColor) => {
    setAccent(newAccent);
    triggerApplyTheme(newAccent, bgTheme);
    const opt = ACCENT_OPTIONS.find((a) => a.id === newAccent);
    if (opt && !opt.isRgb && !opt.isCustom) {
      setAppearance({ accentColor: opt.color, accentPreset: newAccent });
    }
  };

  const handleCustomAccentChange = (hex: string) => {
    setCustomAccentHexState(hex);
    setCustomAccentColor(hex);
    setAccent('custom');
    triggerApplyTheme('custom', bgTheme, hex);
    setAppearance({ accentColor: hex, accentPreset: 'custom' });
  };

  const handleSelectTheme = (newTheme: BackgroundTheme) => {
    setBgTheme(newTheme);
    triggerApplyTheme(accent, newTheme);
    const opt = THEME_OPTIONS.find((t) => t.id === newTheme);
    if (opt && !opt.isCustom) {
      setAppearance({ bgColor: opt.charcoal, bgPreset: newTheme });
    }
  };

  const handleCustomThemeChange = (hex: string) => {
    setCustomThemeHexState(hex);
    setCustomThemeColor(hex);
    setBgTheme('custom');
    triggerApplyTheme(accent, 'custom', customAccentHex, hex);
    setAppearance({ bgColor: hex, bgPreset: 'custom' });
  };

  const handleSaveWindow = async () => {
    await saveWindowSize();
    setSavedMessage(t.windowSizeSaved);
    setTimeout(() => setSavedMessage(null), 2500);
  };

  const handleResetSettings = () => {
    if (window.confirm('¿Deseas restablecer todos los ajustes de la aplicación a sus valores predeterminados?')) {
      resetSettings();
      setSavedMessage('Ajustes restablecidos correctamente.');
      setTimeout(() => setSavedMessage(null), 2500);
    }
  };

  const handleClearCache = () => {
    if (window.confirm('¿Borrar caché temporal, carátulas almacenadas y residuos?')) {
      clearCacheAndResidues();
      setSavedMessage('Caché y residuos eliminados.');
      setTimeout(() => setSavedMessage(null), 2500);
    }
  };

  const exportListeningBackup = () => {
    const backup = {
      format: 'musicx-listening-stats-v1',
      exportedAt: new Date().toISOString(),
      listeningStats,
    };
    const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `musicx-listening-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  const importListeningBackup = async (file: File) => {
    try {
      const backup = JSON.parse(await file.text());
      const stats = backup?.listeningStats;
      if (backup?.format !== 'musicx-listening-stats-v1' ||
          !Number.isFinite(stats?.totalSecondsListened) ||
          !Number.isFinite(stats?.totalTracksPlayed) ||
          !Number.isFinite(stats?.totalSessions)) {
        throw new Error('Formato de backup no válido');
      }
      useMusicStore.getState().setListeningStats({
        totalSecondsListened: Math.max(0, stats.totalSecondsListened),
        totalTracksPlayed: Math.max(0, stats.totalTracksPlayed),
        totalSessions: Math.max(0, stats.totalSessions),
      });
      setSavedMessage('Backup de escucha restaurado.');
    } catch {
      setSavedMessage('No se pudo restaurar el backup de escucha.');
    }
    setTimeout(() => setSavedMessage(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div
        className="w-[840px] max-w-[95vw] h-[640px] max-h-[92vh] flex flex-col rounded-2xl border border-slate-700/70 bg-slate-950/95 text-slate-100 shadow-2xl overflow-hidden transition-all duration-200"
        style={{
          boxShadow: neonGlow ? `0 0 35px var(--app-accent, #06b6d4)33` : undefined,
        }}
      >
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900/70 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: appearance.accentColor || '#06b6d4',
                boxShadow: neonGlow ? `0 0 8px ${appearance.accentColor || '#06b6d4'}` : 'none',
              }}
            />
            <h2 className="text-base font-bold tracking-wide font-mono" style={{ color: appearance.accentColor || '#06b6d4' }}>
              Ajustes de Configuración &bull; musicx
            </h2>
          </div>

          <button
            onClick={() => setSettingsOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center border-b border-slate-800 bg-slate-900/50 shrink-0">
          <button
            onClick={() => tabsRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}
            className="h-11 w-8 shrink-0 flex items-center justify-center text-slate-400 hover:text-white border-r border-slate-800"
            title="Pestañas anteriores"
            aria-label="Desplazar pestañas a la izquierda"
          >
            <ChevronLeft size={16} />
          </button>
          <div ref={tabsRef} className="flex min-w-0 flex-1 px-2 gap-2 overflow-x-auto settings-tabs-scroll">
          {[
            { id: 'general', label: 'General', icon: Sliders },
            { id: 'appearance', label: 'Apariencia (Soundix)', icon: Palette },
            { id: 'cava', label: 'Visualización en Vivo', icon: Activity },
            { id: 'playback', label: 'Reproducción', icon: Music },
            { id: 'audio', label: 'Audio & DSP', icon: Volume2 },
            { id: 'library', label: 'Telemetría Biblioteca', icon: Clock },
            { id: 'about', label: 'Acerca de', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`py-3 px-3.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                style={isActive ? { borderColor: appearance.accentColor, color: appearance.accentColor } : undefined}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
          </div>
          <button
            onClick={() => tabsRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}
            className="h-11 w-8 shrink-0 flex items-center justify-center text-slate-400 hover:text-white border-l border-slate-800"
            title="Pestañas siguientes"
            aria-label="Desplazar pestañas a la derecha"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {savedMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>{savedMessage}</span>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Idioma de la aplicación
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'es' as const, name: 'Español' },
                    { id: 'ca' as const, name: 'Català' },
                    { id: 'en' as const, name: 'English' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLanguage(l.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                        language === l.id
                          ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300 font-bold'
                          : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                      }`}
                      style={language === l.id ? { borderColor: appearance.accentColor, color: appearance.accentColor } : undefined}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Dimensiones de la ventana</div>
                  <div className="text-[11px] text-slate-400">Guarda la posición y tamaño actual para los próximos inicios</div>
                </div>
                <button
                  onClick={handleSaveWindow}
                  className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
                >
                  Guardar Tamaño Actual
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Mantenimiento y Residuos
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleResetSettings}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    <span>Restablecer Ajustes de Fábrica</span>
                  </button>

                  <button
                    onClick={handleClearCache}
                    className="flex-1 py-2 px-3 rounded-xl border border-rose-900/60 bg-rose-950/30 hover:bg-rose-900/40 text-xs font-semibold text-rose-300 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Borrar Caché y Residuos</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Sparkles size={14} style={{ color: appearance.accentColor }} />
                  Color de Acento Predominante
                </label>
                <p className="text-xs text-slate-400">
                  Selecciona el color para botones, deslizadores, carátulas y telemetría:
                </p>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {ACCENT_OPTIONS.map((opt) => {
                    const isSelected = accent === opt.id;
                    const swatchBackground = opt.isRgb
                      ? opt.color
                      : opt.isCustom
                      ? customAccentHex
                      : opt.color;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectAccent(opt.id)}
                        title={opt.label}
                        className={`h-14 rounded-xl border flex flex-col items-center justify-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-400/40'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div
                          className="w-7 h-7 rounded-full shadow flex items-center justify-center shrink-0"
                          style={{ background: swatchBackground }}
                        >
                          {opt.isCustom ? (
                            isSelected ? (
                              <Check size={14} className="text-white stroke-[3]" />
                            ) : (
                              <Plus size={15} className="text-white stroke-[2.5]" />
                            )
                          ) : isSelected ? (
                            <Check size={14} className="text-white stroke-[3]" />
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 mt-1">
                  <span className="text-xs text-slate-300 font-medium">Color de acento personalizado:</span>
                  <div
                    className="relative w-7 h-7 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden cursor-pointer"
                    style={{ backgroundColor: customAccentHex }}
                  >
                    <Plus size={14} className="text-white stroke-[2.5] pointer-events-none" />
                    <input
                      type="color"
                      value={customAccentHex}
                      onChange={(e) => handleCustomAccentChange(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={customAccentHex}
                    onChange={(e) => handleCustomAccentChange(e.target.value)}
                    placeholder="#8b5cf6"
                    className="w-24 px-2 py-1 text-xs font-mono uppercase bg-slate-950 rounded-lg border border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Palette size={14} style={{ color: appearance.accentColor }} />
                  Fondo y Contraste
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEME_OPTIONS.map((opt) => {
                    const isSelected = bgTheme === opt.id;
                    const swatchBg = opt.isCustom
                      ? customThemeHex
                      : opt.id === 'gray_gradient'
                      ? 'linear-gradient(135deg, #161719 0%, #4a4d52 100%)'
                      : opt.charcoal;

                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectTheme(opt.id)}
                        className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-400/30'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-5 h-5 rounded-md border border-white/20 flex items-center justify-center shrink-0"
                            style={{ background: swatchBg }}
                          />
                          <span className="text-xs font-semibold text-slate-200 truncate">
                            {opt.label}
                          </span>
                        </div>
                        {isSelected && <Check size={12} className="text-cyan-400 stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 mt-1">
                  <span className="text-xs text-slate-300 font-medium">Color de fondo personalizado:</span>
                  <div
                    className="relative w-7 h-7 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden cursor-pointer"
                    style={{ backgroundColor: customThemeHex }}
                  >
                    <Plus size={14} className="text-white stroke-[2.5] pointer-events-none" />
                    <input
                      type="color"
                      value={customThemeHex}
                      onChange={(e) => handleCustomThemeChange(e.target.value)}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={customThemeHex}
                    onChange={(e) => handleCustomThemeChange(e.target.value)}
                    placeholder="#0f172a"
                    className="w-24 px-2 py-1 text-xs font-mono uppercase bg-slate-950 rounded-lg border border-slate-800 text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">Transparencia y Glassmorphism</span>
                  <span className="font-mono text-cyan-400 font-bold">{Math.round(bgOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="1.0"
                  step="0.05"
                  value={bgOpacity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setBgOpacity(val);
                    triggerApplyTheme(accent, bgTheme, customAccentHex, customThemeHex, val);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Resplandor Neón Activo</div>
                    <div className="text-[11px] text-slate-400">Iluminación externa en bordes y botones de control</div>
                  </div>
                  <button
                    onClick={() => {
                      const next = !neonGlow;
                      setNeonGlow(next);
                      triggerApplyTheme(accent, bgTheme, customAccentHex, customThemeHex, bgOpacity, next);
                    }}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      neonGlow ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${neonGlow ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
                {neonGlow && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400">Intensidad:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={neonIntensity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setNeonIntensity(val);
                        triggerApplyTheme(accent, bgTheme, customAccentHex, customThemeHex, bgOpacity, neonGlow, val);
                      }}
                      className="flex-1 accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-cyan-400">{Math.round(neonIntensity * 100)}%</span>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Bordes Tintados con Acento</div>
                    <div className="text-[11px] text-slate-400">Marcos de ventanas ligeramente pigmentados con el color de acento</div>
                  </div>
                  <button
                    onClick={() => {
                      const next = !tintedBorders;
                      setTintedBorders(next);
                      triggerApplyTheme(accent, bgTheme, customAccentHex, customThemeHex, bgOpacity, neonGlow, neonIntensity, next);
                    }}
                    className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                      tintedBorders ? 'bg-cyan-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${tintedBorders ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
                {tintedBorders && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400">Tinte:</span>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={tintedBordersRatio}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setTintedBordersRatio(val);
                        triggerApplyTheme(accent, bgTheme, customAccentHex, customThemeHex, bgOpacity, neonGlow, neonIntensity, tintedBorders, val);
                      }}
                      className="flex-1 accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-cyan-400">{Math.round(tintedBordersRatio * 100)}%</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Curvatura de Esquinas
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'square' as CornerRadius, label: 'Recto (0px)' },
                    { id: 'industrial' as CornerRadius, label: 'DAW (4px)' },
                    { id: 'modern' as CornerRadius, label: 'Moderno (8px)' },
                    { id: 'smooth' as CornerRadius, label: 'Suave (14px)' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setCornerRadius(r.id);
                        triggerApplyTheme(accent, bgTheme, customAccentHex, customThemeHex, bgOpacity, neonGlow, neonIntensity, tintedBorders, tintedBordersRatio, r.id);
                      }}
                      className={`p-2 rounded-lg border text-xs font-semibold transition cursor-pointer text-center flex flex-col items-center gap-2 ${
                        cornerRadius === r.id
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-10 h-7 border border-current bg-slate-950/40" style={{ borderRadius: r.id === 'square' ? 0 : r.id === 'industrial' ? 4 : r.id === 'modern' ? 8 : 14 }} />
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Resplandor Ambiental de Estudio</span>
                  <input
                    type="checkbox"
                    checked={ambientGlow}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setAmbientGlow(next);
                      triggerApplyTheme(accent, bgTheme, customAccentHex, customThemeHex, bgOpacity, neonGlow, neonIntensity, tintedBorders, tintedBordersRatio, cornerRadius, next);
                    }}
                    className="accent-cyan-400 cursor-pointer"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200">Barras de Desplazamiento Mínimas</span>
                  <input
                    type="checkbox"
                    checked={minimalScrollbars}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setMinimalScrollbars(next);
                      triggerApplyTheme(accent, bgTheme, customAccentHex, customThemeHex, bgOpacity, neonGlow, neonIntensity, tintedBorders, tintedBordersRatio, cornerRadius, ambientGlow, next);
                    }}
                    className="accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cava' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Activity size={15} className="text-cyan-400" />
                  Motor CAVA y Espectro en Vivo
                </h3>
                <p className="text-xs text-slate-400">
                  Ajustes compartidos para CAVA fluido y todos los estilos del espectro en vivo: resolución, dinámica, retención, simetría y paleta.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <label className="text-xs font-bold text-slate-300">Estilo del espectro en vivo</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SPECTRUM_STYLES.map((style) => (
                    <button key={style.id} onClick={() => setAppearance({ spectrumStyle: style.id })}
                      className={`p-2 rounded-lg border text-[11px] font-semibold ${appearance.spectrumStyle === style.id ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300' : 'border-slate-800 bg-slate-900/60 text-slate-400'}`}>
                      {style.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <label className="text-xs font-bold text-slate-300">Tasa de refresco / Fluidez visual</label>
                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 120, 144].map((fps) => (
                    <button
                      key={fps}
                      onClick={() => setAppearance({ spectrumFps: fps as 30 | 60 | 120 | 144 })}
                      className={`p-2 rounded-xl border text-xs font-mono font-bold transition cursor-pointer text-center ${
                        appearance.spectrumFps === fps
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {fps} FPS
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-300">Número de Barras FFT</span>
                    <span className="font-mono text-cyan-400 font-bold">{appearance.cavaBars}</span>
                  </div>
                  <input
                    type="range"
                    min="32"
                    max="128"
                    step="16"
                    value={appearance.cavaBars}
                    onChange={(e) => setAppearance({ cavaBars: parseInt(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-300">Sensibilidad de Ganancia</span>
                    <span className="font-mono text-cyan-400 font-bold">{appearance.cavaSensitivity}%</span>
                  </div>
                  <input
                    type="range"
                    min="25"
                    max="200"
                    step="5"
                    value={appearance.cavaSensitivity}
                    onChange={(e) => setAppearance({ cavaSensitivity: parseInt(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-xs"><span className="font-bold text-slate-300">Suavizado de caída</span><span className="font-mono text-cyan-400">{appearance.cavaSmoothing}%</span></div>
                  <input type="range" min="0" max="95" step="5" value={appearance.cavaSmoothing} onChange={(e) => setAppearance({ cavaSmoothing: parseInt(e.target.value) })} className="w-full accent-cyan-400" />
                </div>
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                  <label className="text-xs font-bold text-slate-300">Paleta de CAVA</label>
                  <select value={appearance.cavaPalette} onChange={(e) => setAppearance({ cavaPalette: e.target.value as typeof appearance.cavaPalette })} className="w-full rounded bg-slate-950 border border-slate-700 p-2 text-xs text-slate-200">
                    <option value="accent">Acento + Aurora</option><option value="aurora">Aurora</option><option value="fire">Fuego</option><option value="mono">Monocromo de acento</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'cavaPeakHold' as const, label: 'Retener picos' },
                  { key: 'cavaMirrored' as const, label: 'Onda simétrica' },
                ].map((option) => (
                  <label key={option.key} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs text-slate-200">
                    {option.label}<input type="checkbox" checked={appearance[option.key]} onChange={(e) => setAppearance({ [option.key]: e.target.checked })} className="accent-cyan-400" />
                  </label>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <label className="text-xs font-bold text-slate-300">Física de Caída / Gravedad</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'monstercat', label: 'Monstercat (Fluido)' },
                    { id: 'studio', label: 'Estudio Lineal' },
                    { id: 'instant', label: 'Respuesta Instantánea' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAppearance({ cavaGravity: m.id as 'monstercat' | 'studio' | 'instant' })}
                      className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                        appearance.cavaGravity === m.id
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Fallback Anti-pérdida Espectral Offline
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Mantiene el buffer local para restaurar la física FFT en caso de saturación o desconexión
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={appearance.cavaOfflineFallback}
                  onChange={(e) => setAppearance({ cavaOfflineFallback: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'playback' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-4">
                <div><div className="text-xs font-bold text-slate-200">BPM fijo</div><div className="text-[11px] text-slate-400">El valor del indicador no depende del bitrate de la pista.</div></div>
                <div className="flex items-center gap-2"><input type="number" min="40" max="240" value={playbackSettings.bpmValue} onChange={(e) => setPlaybackSettings({ bpmValue: Math.max(40, Math.min(240, parseInt(e.target.value) || 128)) })} className="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-center font-mono text-sm" /><span className="text-xs text-slate-400">BPM</span></div>
              </div>
              <label className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-200">
                Parpadeo luminoso sincronizado al BPM<input type="checkbox" checked={playbackSettings.bpmPulseEnabled} onChange={(e) => setPlaybackSettings({ bpmPulseEnabled: e.target.checked })} className="accent-cyan-400" />
              </label>
              <label className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between gap-4 text-xs font-bold text-slate-200">
                <span><span className="block">Pulso BPM en el botón Play</span><span className="mt-1 block text-[11px] font-normal text-slate-400">Anima el botón principal al ritmo del BPM fijo mientras reproduce.</span></span>
                <input type="checkbox" checked={playbackSettings.playButtonBpmPulseEnabled} onChange={(e) => setPlaybackSettings({ playButtonBpmPulseEnabled: e.target.checked })} className="accent-cyan-400 shrink-0" />
              </label>
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Estilo de Barra de Reproducción
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'spectrum' as const, label: 'Espectro de la Canción (Waveform Scrubber)' },
                    { id: 'classic' as const, label: 'Clásico Range Slider' },
                    { id: 'hybrid' as const, label: 'Clásico + Forma de Onda' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setPlaybackSettings({ playerBarStyle: style.id })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                        playbackSettings.playerBarStyle === style.id
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">Difuminado de Carátula en Fondo de Lista</div>
                    <div className="text-[11px] text-slate-400">Muestra la portada de la canción actual con desenfoque artístico en la biblioteca</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={playbackSettings.diffuseAlbumArt}
                    onChange={(e) => setPlaybackSettings({ diffuseAlbumArt: e.target.checked })}
                    className="accent-cyan-400 w-4 h-4 cursor-pointer"
                  />
                </div>
                {playbackSettings.diffuseAlbumArt && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400">Transparencia:</span>
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={playbackSettings.diffuseAlbumArtOpacity}
                      onChange={(e) => setPlaybackSettings({ diffuseAlbumArtOpacity: parseInt(e.target.value) })}
                      className="flex-1 accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-cyan-400">{playbackSettings.diffuseAlbumArtOpacity}%</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Reproducir Automáticamente al Arrastrar Archivos</div>
                  <div className="text-[11px] text-slate-400">Inicia de inmediato al soltar archivos de audio sobre la ventana</div>
                </div>
                <input
                  type="checkbox"
                  checked={playbackSettings.autoPlayOnDrop}
                  onChange={(e) => setPlaybackSettings({ autoPlayOnDrop: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Motor de Decodificación y Remuestreo Hi-Fi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bit_perfect' as const, label: 'ALSA Direct Bit-Perfect' },
                    { id: 'symphonia_96k' as const, label: 'Symphonia 96 kHz' },
                    { id: 'float32' as const, label: 'Float32 PipeWire HD' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAudioSettings({ resamplingQuality: m.id })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                        audioSettings.resamplingQuality === m.id
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Tamaño de Buffer y Latencia PCM
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ultra_low' as const, label: 'Ultra Baja (64 spls)' },
                    { id: 'low' as const, label: 'Baja (256 spls)' },
                    { id: 'stable' as const, label: 'Estable (1024 spls)' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setAudioSettings({ bufferLatency: b.id })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                        audioSettings.bufferLatency === b.id
                          ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">Ganancia Extra de Volumen (+35% Boost)</div>
                  <div className="text-[11px] text-slate-400">Permite subir el deslizador hasta 135% con indicador en rojo</div>
                </div>
                <input
                  type="checkbox"
                  checked={audioSettings.allowExtraVolumeBoost}
                  onChange={(e) => setAudioSettings({ allowExtraVolumeBoost: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Clock size={15} className="text-cyan-400" />
                  Telemetría de Biblioteca y Estadísticas Reales
                </h3>
                <p className="text-xs text-slate-400">
                  Métricas acumuladas de escucha y catálogo de pistas registradas en caché local.
                </p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Pistas en Colección</span>
                  <span className="text-2xl font-mono font-bold text-white mt-1">{totalTracks}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">{totalLibraryHours} h totales de audio</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Tiempo Escuchando</span>
                  <span className="text-2xl font-mono font-bold text-cyan-400 mt-1">
                    {listenedHours}h {listenedMinutes}m
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Contador real en caché</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Sesiones Activas</span>
                  <span className="text-2xl font-mono font-bold text-slate-300 mt-1">
                    {listeningStats.totalSessions}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Inicios registrados</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Canciones reproducidas</span>
                  <span className="text-2xl font-mono font-bold text-slate-300 mt-1">{listeningStats.totalTracksPlayed}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Reproducciones iniciadas</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <button onClick={exportListeningBackup} className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold hover:bg-slate-700 flex items-center gap-2"><Download size={13} />Backup de tiempo</button>
                  <button onClick={() => statsBackupInputRef.current?.click()} className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold hover:bg-slate-700 flex items-center gap-2"><Upload size={13} />Restaurar backup</button>
                  <input ref={statsBackupInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) void importListeningBackup(file); e.currentTarget.value = ''; }} />
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('¿Reiniciar a cero todas las estadísticas de escucha?')) {
                      resetStats();
                      setSavedMessage('Estadísticas de escucha reiniciadas.');
                      setTimeout(() => setSavedMessage(null), 2500);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/40 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 transition cursor-pointer"
                >
                  Reiniciar Estadísticas
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Carpeta Principal de la Biblioteca</label>
                  <button
                    onClick={() => {
                      if (librarySettings.musicFolder) {
                        startDirectoryScan(librarySettings.musicFolder, true);
                        setSavedMessage('Escaneo de biblioteca iniciado en segundo plano...');
                        setTimeout(() => setSavedMessage(null), 3000);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg border border-cyan-700/60 bg-cyan-950/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/40 transition cursor-pointer"
                  >
                    Escanear Ahora
                  </button>
                </div>
                <input
                  type="text"
                  value={librarySettings.musicFolder}
                  onChange={(e) => setLibrarySettings({ musicFolder: e.target.value })}
                  placeholder="/home/usuario/Música"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200"
                />
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <img src="/musicx-logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono">musicx &bull; the audio player</h3>
                    <span className="text-[11px] font-mono text-cyan-400">Versión 0.1.0-alpha Hi-Fi Direct</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  musicx es un reproductor de audio modular de ventanas de alta fidelidad para Linux y sistemas de sonido modernos, diseñado para proporcionar reproducción directa ALSA Bit-Perfect y streaming PipeWire de latencia ultra reducida.
                </p>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Incorpora el motor de ecualización y algoritmos de aspecto de Soundix Audio Toolbox, simulación analógica de vinilo a 33.3 RPM, motores DSP por hardware LG XDSS Plus y XTS Pro, y visualizador espectral con física inspirada en CAVA.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Decodificador:</span>
                  <span className="ml-2 font-mono text-slate-200">Symphonia v0.5 (Rust)</span>
                </div>
                <div>
                  <span className="text-slate-400">Backend Audio:</span>
                  <span className="ml-2 font-mono text-slate-200">CPAL ALSA / PipeWire</span>
                </div>
                <div>
                  <span className="text-slate-400">Visualizador:</span>
                  <span className="ml-2 font-mono text-slate-200">CAVA FFT Engine</span>
                </div>
                <div>
                  <span className="text-slate-400">Licencia:</span>
                  <span className="ml-2 font-mono text-slate-200">MIT &bull; Código Abierto</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
