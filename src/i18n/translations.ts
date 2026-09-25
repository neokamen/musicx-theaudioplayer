export type Language = 'es' | 'ca' | 'en';

export interface TranslationDictionary {
  settings: string;
  general: string;
  appearance: string;
  audio: string;
  playback: string;
  library: string;
  about: string;
  language: string;
  saveWindowSize: string;
  windowSizeSaved: string;
  resetSettings: string;
  resetSettingsConfirm: string;
  settingsReset: string;
  clearCache: string;
  cacheCleared: string;
  accentColor: string;
  backgroundColor: string;
  customColor: string;
  glassmorphism: string;
  blurAmount: string;
  neonGlow: string;
  glowIntensity: string;
  borderEffect: string;
  borderOpacity: string;
  borderRadius: string;
  borderGlow: string;
  spectrumVisualizer: string;
  spectrumStyle: string;
  spectrumFps: string;
  extraVolumeGain: string;
  extraVolumeGainDesc: string;
  resamplingQuality: string;
  bufferLatency: string;
  ditherEngine: string;
  xdssDynamicPunch: string;
  xdssDynamicPunchDesc: string;
  tubeWarmth: string;
  tubeWarmthDesc: string;
  soundixNormalizer: string;
  soundixNormalizerDesc: string;
  crossfadeDuration: string;
  gaplessPlayback: string;
  replayGainMode: string;
  autoPlayOnDrop: string;
  musicFolder: string;
  browseFolder: string;
  autoScanStartup: string;
  scanLibraryNow: string;
  clearDatabase: string;
  totalTracks: string;
  statsSection: string;
  totalTracksPlayed: string;
  totalHoursListened: string;
  totalSessions: string;
  resetStats: string;
  statsReset: string;
  aboutTitle: string;
  aboutDesc: string;
  aboutArchitecture: string;
  aboutEngine: string;
  folderExplorer: string;
  virtualTracklist: string;
  coverInspector: string;
  dacTelemetry: string;
  queue: string;
  editLayout: string;
  doneEditing: string;
  bitPerfect: string;
  sharedAudio: string;
  playing: string;
  paused: string;
  stopped: string;
  noTrackSelected: string;
  syncLibrary: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  es: {
    settings: 'Ajustes',
    general: 'Generales',
    appearance: 'Apariencia',
    audio: 'Audio',
    playback: 'Reproducción',
    library: 'Biblioteca',
    about: 'Acerca de',
    language: 'Idioma de la interfaz',
    saveWindowSize: 'Guardar tamaño de ventana',
    windowSizeSaved: '¡Tamaño guardado correctamente!',
    resetSettings: 'Restablecer ajustes de fábrica',
    resetSettingsConfirm: '¿Restablecer todos los ajustes a los valores predeterminados?',
    settingsReset: 'Ajustes restablecidos',
    clearCache: 'Limpiar caché y residuos de la aplicación',
    cacheCleared: 'Caché y residuos eliminados',
    accentColor: 'Color de acento',
    backgroundColor: 'Color de fondo',
    customColor: 'Color Personalizado',
    glassmorphism: 'Efecto Cristal (Glassmorphism)',
    blurAmount: 'Desenfoque de cristal',
    neonGlow: 'Efecto Neón en botones y acentos',
    glowIntensity: 'Intensidad de brillo Neón',
    borderEffect: 'Estilo de bordes personalizados',
    borderOpacity: 'Opacidad del borde',
    borderRadius: 'Radio de curvatura de bordes',
    borderGlow: 'Resplandor en bordes al pasar el cursor',
    spectrumVisualizer: 'Espectro de audio a tiempo real',
    spectrumStyle: 'Estilo del espectro visual',
    spectrumFps: 'Rendimiento (FPS)',
    extraVolumeGain: 'Ganancia extra de volumen (+25% Boost)',
    extraVolumeGainDesc: 'Permite subir el deslizador de volumen de 100% hasta 125% con anclaje a 100%.',
    resamplingQuality: 'Calidad de remuestreo (Resampling)',
    bufferLatency: 'Latencia y tamaño de buffer PCM',
    ditherEngine: 'Motor de Dithering',
    xdssDynamicPunch: 'Realce Dinámico XDSS',
    xdssDynamicPunchDesc: 'Procesamiento de pegada dinámica para graves y frecuencias de presencia.',
    tubeWarmth: 'Calidez Analógica a Válvulas',
    tubeWarmthDesc: 'Emulación de saturación armónica sutil estilo equipo Hi-Fi valvular.',
    soundixNormalizer: 'Normalizador Soundix / ReplayGain',
    soundixNormalizerDesc: 'Control de picos y volumen perceptual para evitar saturación.',
    crossfadeDuration: 'Duración de fundido cruzado (Crossfade)',
    gaplessPlayback: 'Reproducción Continua Sin Pausa (Gapless)',
    replayGainMode: 'Modo ReplayGain',
    autoPlayOnDrop: 'Reproducir automáticamente al arrastrar pistas',
    musicFolder: 'Carpeta principal de la biblioteca',
    browseFolder: 'Examinar carpeta',
    autoScanStartup: 'Escanear automáticamente al iniciar',
    scanLibraryNow: 'Sincronizar biblioteca ahora',
    clearDatabase: 'Limpiar caché y base de datos',
    totalTracks: 'Pistas registradas',
    statsSection: 'Estadísticas de escucha (Telemetría de Uso)',
    totalTracksPlayed: 'Pistas reproducidas',
    totalHoursListened: 'Horas escuchando música',
    totalSessions: 'Sesiones de reproducción',
    resetStats: 'Reiniciar estadísticas',
    statsReset: 'Estadísticas reiniciadas a 0',
    aboutTitle: 'musicx — The Audio Player',
    aboutDesc: 'Reproductor Hi-Fi audiófilo con arquitectura de ventanas modulares y salida directa bit-perfect.',
    aboutArchitecture: 'Ventanas Modulares Flexibles con acoplamiento libre, splitters y guardado de layouts.',
    aboutEngine: 'Motor de audio Symphonia + ALSA Bit-Perfect Direct en Rust para máxima fidelidad sonora.',
    folderExplorer: 'Explorador de Carpetas',
    virtualTracklist: 'Lista de Canciones / Biblioteca',
    coverInspector: 'Carátula & Inspector Técnico',
    dacTelemetry: 'Telemetría Hi-Fi & DAC',
    queue: 'Cola de Reproducción',
    editLayout: 'Editar Interfaz',
    doneEditing: 'Finalizar Edición',
    bitPerfect: 'ALSA Bit-Perfect Directo',
    sharedAudio: 'Sistema Compartido (PipeWire)',
    playing: 'Reproduciendo',
    paused: 'Pausado',
    stopped: 'Detenido',
    noTrackSelected: 'Sin pista seleccionada',
    syncLibrary: 'Sincronizar',
  },
  ca: {
    settings: 'Ajustos',
    general: 'Generals',
    appearance: 'Apariència',
    audio: 'Àudio',
    playback: 'Reproducció',
    library: 'Biblioteca',
    about: 'Quant a',
    language: 'Idioma de la interfície',
    saveWindowSize: 'Desar la mida de la finestra',
    windowSizeSaved: '¡Mida desada correctament!',
    resetSettings: 'Restablir ajustos de fàbrica',
    resetSettingsConfirm: 'Voleu restablir tots els ajustos als valors per defecte?',
    settingsReset: 'Ajustos restablerts',
    clearCache: 'Netejar memòria cau i residus de l\'aplicació',
    cacheCleared: 'Memòria cau i residus eliminats',
    accentColor: 'Color de destacament',
    backgroundColor: 'Color de fons',
    customColor: 'Color Personalitzat',
    glassmorphism: 'Efecte Vidre (Glassmorphism)',
    blurAmount: 'Desenfoncament de vidre',
    neonGlow: 'Efecte Neó en botons i destacamens',
    glowIntensity: 'Intensitat de la brillantor Neó',
    borderEffect: 'Estil de vores personalitzat',
    borderOpacity: 'Opacitat de la vora',
    borderRadius: 'Radi de curvatura de les vores',
    borderGlow: 'Resplendor en vores al passar el cursor',
    spectrumVisualizer: 'Espectre d\'àudio en temps real',
    spectrumStyle: 'Estil de l\'espectre visual',
    spectrumFps: 'Rendiment (FPS)',
    extraVolumeGain: 'Guany d\'àudio addicional (+25% Boost)',
    extraVolumeGainDesc: 'Permet pujar el control de volum del 100% al 125% amb ancoratge al 100%.',
    resamplingQuality: 'Qualitat de mostratge (Resampling)',
    bufferLatency: 'Latència i mida de buffer PCM',
    ditherEngine: 'Motor de Dithering',
    xdssDynamicPunch: 'Realç Dinàmic XDSS',
    xdssDynamicPunchDesc: 'Processament de pegada dinàmica per a greus i presència.',
    tubeWarmth: 'Calidesa Analògica a Vàlvules',
    tubeWarmthDesc: 'Emulació de saturació harmònica suau d\'equips a vàlvules Hi-Fi.',
    soundixNormalizer: 'Normalitzador Soundix / ReplayGain',
    soundixNormalizerDesc: 'Control de pics i volum perceptual per evitar saturació.',
    crossfadeDuration: 'Durada del fos creuat (Crossfade)',
    gaplessPlayback: 'Reproducció Contínua Sense Pauses (Gapless)',
    replayGainMode: 'Mode ReplayGain',
    autoPlayOnDrop: 'Reproduir automàticament en arrossegar pistes',
    musicFolder: 'Carpeta principal de la biblioteca',
    browseFolder: 'Explorar carpeta',
    autoScanStartup: 'Escanejar automàticament en iniciar',
    scanLibraryNow: 'Sincronitzar biblioteca ara',
    clearDatabase: 'Netejar memòria cau i base de dades',
    totalTracks: 'Pistes registrades',
    statsSection: 'Estadístiques d\'escolta (Telemetria d\'Ús)',
    totalTracksPlayed: 'Pistes reproduïdes',
    totalHoursListened: 'Hores escoltant música',
    totalSessions: 'Sessions de reproducció',
    resetStats: 'Reiniciar estadístiques',
    statsReset: 'Estadístiques reiniciades a 0',
    aboutTitle: 'musicx — The Audio Player',
    aboutDesc: 'Reproductor Hi-Fi audiòfil amb arquitectura de finestres modulars i sortida directa bit-perfect.',
    aboutArchitecture: 'Finestres Modulars Flexibles amb acoblament lliure, splitters i desament de disposicions.',
    aboutEngine: 'Motor d\'àudio Symphonia + ALSA Bit-Perfect Directe en Rust per a màxima fidelitat acústica.',
    folderExplorer: 'Explorador de Carpetes',
    virtualTracklist: 'Llista de Cançons / Biblioteca',
    coverInspector: 'Caràtula & Inspector Tècnic',
    dacTelemetry: 'Telemetria Hi-Fi & DAC',
    queue: 'Cua de Reproducció',
    editLayout: 'Editar Interfície',
    doneEditing: 'Finalitzar Edició',
    bitPerfect: 'ALSA Bit-Perfect Directe',
    sharedAudio: 'Sistema Compartit (PipeWire)',
    playing: 'Reproduint',
    paused: 'Pausat',
    stopped: 'Aturat',
    noTrackSelected: 'Sense pista seleccionada',
    syncLibrary: 'Sincronitzar',
  },
  en: {
    settings: 'Settings',
    general: 'General',
    appearance: 'Appearance',
    audio: 'Audio',
    playback: 'Playback',
    library: 'Library',
    about: 'About',
    language: 'Interface Language',
    saveWindowSize: 'Save window size',
    windowSizeSaved: 'Window size saved successfully!',
    resetSettings: 'Reset to Factory Defaults',
    resetSettingsConfirm: 'Are you sure you want to reset all settings to defaults?',
    settingsReset: 'Settings have been reset',
    clearCache: 'Clear App Cache & Residues',
    cacheCleared: 'Cache and residues cleared',
    accentColor: 'Accent Color',
    backgroundColor: 'Background Color',
    customColor: 'Custom Color',
    glassmorphism: 'Glassmorphism Effect',
    blurAmount: 'Glass Blur Amount',
    neonGlow: 'Neon Glow on Buttons & Accents',
    glowIntensity: 'Neon Glow Intensity',
    borderEffect: 'Custom Border Styling',
    borderOpacity: 'Border Opacity',
    borderRadius: 'Border Corner Radius',
    borderGlow: 'Border Hover Glow',
    spectrumVisualizer: 'Real-time Audio Spectrum',
    spectrumStyle: 'Spectrum Visual Style',
    spectrumFps: 'Performance (FPS)',
    extraVolumeGain: 'Extra Volume Gain (+25% Boost)',
    extraVolumeGainDesc: 'Allows dragging volume slider beyond 100% up to 125% with magnetic snap at 100%.',
    resamplingQuality: 'Resampling Quality',
    bufferLatency: 'Buffer Latency & PCM Target',
    ditherEngine: 'Dithering Engine',
    xdssDynamicPunch: 'XDSS Dynamic Punch',
    xdssDynamicPunchDesc: 'Dynamic bass punch and upper-range presence enhancement.',
    tubeWarmth: 'Analog Vacuum Tube Warmth',
    tubeWarmthDesc: 'Subtle even-order harmonic saturation modeling vintage Hi-Fi tube gear.',
    soundixNormalizer: 'Soundix Peak Normalizer & ReplayGain',
    soundixNormalizerDesc: 'True-peak limiting and perceptual loudness normalization.',
    crossfadeDuration: 'Crossfade Duration',
    gaplessPlayback: 'Gapless Playback',
    replayGainMode: 'ReplayGain Mode',
    autoPlayOnDrop: 'Auto-play on track drop',
    musicFolder: 'Main Music Collection Folder',
    browseFolder: 'Browse Folder',
    autoScanStartup: 'Automatically scan on startup',
    scanLibraryNow: 'Sync Library Now',
    clearDatabase: 'Clear Cache & Database',
    totalTracks: 'Registered Tracks',
    statsSection: 'Listening Statistics & Metrics',
    totalTracksPlayed: 'Tracks Played',
    totalHoursListened: 'Hours Listened',
    totalSessions: 'Playback Sessions',
    resetStats: 'Reset Statistics',
    statsReset: 'Statistics reset to 0',
    aboutTitle: 'musicx — The Audio Player',
    aboutDesc: 'Audiophile Hi-Fi audio player featuring modular dockable panels and ALSA bit-perfect direct output.',
    aboutArchitecture: 'Modular Window Layout with flexible splits, dockable panels, and persistent custom presets.',
    aboutEngine: 'Symphonia audio engine + ALSA bit-perfect direct output implemented in Rust.',
    folderExplorer: 'Folder Explorer',
    virtualTracklist: 'Virtual Tracklist',
    coverInspector: 'Cover & Inspector',
    dacTelemetry: 'Hi-Fi & DAC Telemetry',
    queue: 'Playback Queue',
    editLayout: 'Edit Layout',
    doneEditing: 'Done Editing',
    bitPerfect: 'ALSA Bit-Perfect Direct',
    sharedAudio: 'Shared System (PipeWire)',
    playing: 'Playing',
    paused: 'Paused',
    stopped: 'Stopped',
    noTrackSelected: 'No track selected',
    syncLibrary: 'Sync Library',
  },
};
