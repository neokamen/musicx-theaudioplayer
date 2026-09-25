import React, { useState } from 'react';
import { useAppStore } from '../../store/index.ts';
import { translations } from '../../i18n/translations.ts';

export const SettingsModal: React.FC = () => {
  const isSettingsOpen = useAppStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const appearance = useAppStore((s) => s.appearance);
  const setAppearance = useAppStore((s) => s.setAppearance);
  const librarySettings = useAppStore((s) => s.librarySettings);
  const setLibrarySettings = useAppStore((s) => s.setLibrarySettings);
  const startDirectoryScan = useAppStore((s) => s.startDirectoryScan);
  const saveWindowSize = useAppStore((s) => s.saveWindowSize);
  const totalTracks = useAppStore((s) => s.libraryTracks.length);

  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'library'>('general');
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
        className="w-[720px] max-w-[92vw] max-h-[85vh] flex flex-col rounded-xl border border-slate-700/60 bg-slate-950/95 text-slate-100 shadow-2xl overflow-hidden"
        style={{
          boxShadow: appearance.neonGlow
            ? `0 0 35px ${appearance.accentColor}33`
            : undefined,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
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

        {/* Tabs */}
        <div className="flex border-b border-slate-800 px-6 gap-2 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === 'general'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🌐 {t.general}
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === 'appearance'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎨 {t.appearance}
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition ${
              activeTab === 'library'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            🎵 {t.library}
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 block">
                  {t.language}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setLanguage('es')}
                    className={`py-3 px-4 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 transition ${
                      language === 'es'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-md'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>🇪🇸</span> Castellano
                  </button>

                  <button
                    onClick={() => setLanguage('ca')}
                    className={`py-3 px-4 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 transition ${
                      language === 'ca'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-md'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>🚩</span> Català
                  </button>

                  <button
                    onClick={() => setLanguage('en')}
                    className={`py-3 px-4 rounded-lg border font-medium text-sm flex items-center justify-center gap-2 transition ${
                      language === 'en'
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-md'
                        : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span>🇬🇧</span> English
                  </button>
                </div>
              </div>

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
                    className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition shadow-md"
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
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* Accent Color */}
              <div className="space-y-3">
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

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-slate-300">{t.totalTracks}:</span>
                  <span className="font-mono text-cyan-400 font-bold text-sm">
                    {totalTracks}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={() => setSettingsOpen(false)}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm shadow-md transition"
          >
            Guardar & Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
