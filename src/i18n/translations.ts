export type Language = 'es' | 'ca' | 'en';

export interface TranslationDictionary {
  settings: string;
  general: string;
  appearance: string;
  library: string;
  language: string;
  saveWindowSize: string;
  windowSizeSaved: string;
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
  musicFolder: string;
  browseFolder: string;
  autoScanStartup: string;
  scanLibraryNow: string;
  clearDatabase: string;
  totalTracks: string;
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
    library: 'Biblioteca',
    language: 'Idioma del sistema',
    saveWindowSize: 'Guardar tamaño de ventana',
    windowSizeSaved: '¡Tamaño guardado!',
    accentColor: 'Color de acento',
    backgroundColor: 'Color de fondo',
    customColor: 'Personalizado',
    glassmorphism: 'Efecto Cristal (Glassmorphism)',
    blurAmount: 'Desenfoque de cristal',
    neonGlow: 'Efecto Neón en botones y acentos',
    glowIntensity: 'Intensidad de brillo Neón',
    borderEffect: 'Estilo de bordes personalizados',
    borderOpacity: 'Opacidad del borde',
    borderRadius: 'Radio de curvatura de bordes',
    borderGlow: 'Resplandor en bordes pasados por cursor',
    spectrumVisualizer: 'Espectro de audio a tiempo real',
    spectrumStyle: 'Estilo del espectro',
    spectrumFps: 'Fotogramas por segundo (FPS)',
    musicFolder: 'Carpeta principal de la biblioteca',
    browseFolder: 'Examinar carpeta',
    autoScanStartup: 'Escanear automáticamente al iniciar',
    scanLibraryNow: 'Sincronizar biblioteca ahora',
    clearDatabase: 'Limpiar caché y base de datos',
    totalTracks: 'Pistas registradas',
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
    library: 'Biblioteca',
    language: 'Idioma del sistema',
    saveWindowSize: 'Desar la mida de la finestra',
    windowSizeSaved: '¡Mida desada!',
    accentColor: 'Color de destacament',
    backgroundColor: 'Color de fons',
    customColor: 'Personalitzat',
    glassmorphism: 'Efecte Vidre (Glassmorphism)',
    blurAmount: 'Desenfoncament de vidre',
    neonGlow: 'Efecte Neó en botons i destacamens',
    glowIntensity: 'Intensitat de la brillantor Neó',
    borderEffect: 'Estil de vores personalitzat',
    borderOpacity: 'Opacitat de la vora',
    borderRadius: 'Radi de curvatura de les vores',
    borderGlow: 'Resplendor en vores al passar el cursor',
    spectrumVisualizer: 'Espectre d\'àudio en temps real',
    spectrumStyle: 'Estil de l\'espectre',
    spectrumFps: 'Fotogrames per segon (FPS)',
    musicFolder: 'Carpeta principal de la biblioteca',
    browseFolder: 'Explorar carpeta',
    autoScanStartup: 'Escanejar automàticament en iniciar',
    scanLibraryNow: 'Sincronitzar biblioteca ara',
    clearDatabase: 'Netejar memòria cau i base de dades',
    totalTracks: 'Pistes registrades',
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
    library: 'Library',
    language: 'System Language',
    saveWindowSize: 'Save window size',
    windowSizeSaved: 'Window size saved!',
    accentColor: 'Accent Color',
    backgroundColor: 'Background Color',
    customColor: 'Custom',
    glassmorphism: 'Glassmorphism Effect',
    blurAmount: 'Glass Blur Amount',
    neonGlow: 'Neon Glow on Buttons & Accents',
    glowIntensity: 'Neon Glow Intensity',
    borderEffect: 'Custom Border Styling',
    borderOpacity: 'Border Opacity',
    borderRadius: 'Border Corner Radius',
    borderGlow: 'Border Hover Glow',
    spectrumVisualizer: 'Real-time Audio Spectrum',
    spectrumStyle: 'Spectrum Style',
    spectrumFps: 'Frames Per Second (FPS)',
    musicFolder: 'Main Music Collection Folder',
    browseFolder: 'Browse Folder',
    autoScanStartup: 'Automatically scan on startup',
    scanLibraryNow: 'Sync Library Now',
    clearDatabase: 'Clear Cache & Database',
    totalTracks: 'Registered Tracks',
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
