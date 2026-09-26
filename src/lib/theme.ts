export type AccentColor = 'green' | 'orange' | 'yellow' | 'blue' | 'red' | 'purple' | 'rgb' | 'custom';
export type BackgroundTheme =
  | 'gray'
  | 'dark_gray'
  | 'black'
  | 'gray_gradient'
  | 'gruvbox'
  | 'nord'
  | 'tokyonight'
  | 'white'
  | 'custom';

export interface AccentOption {
  id: AccentColor;
  label: string;
  color: string;
  hoverColor: string;
  isRgb?: boolean;
  isCustom?: boolean;
}

export interface ThemeOption {
  id: BackgroundTheme;
  label: string;
  charcoal: string;
  surface: string;
  surfacePanel: string;
  border: string;
  cream: string;
  isLight?: boolean;
  isCustom?: boolean;
}

export const ACCENT_OPTIONS: AccentOption[] = [
  { id: 'green', label: 'Verde', color: '#556b2f', hoverColor: '#68833a' },
  { id: 'orange', label: 'Naranja', color: '#d96b27', hoverColor: '#ea7933' },
  { id: 'yellow', label: 'Amarillo', color: '#d4af37', hoverColor: '#e2be4a' },
  { id: 'blue', label: 'Azul', color: '#2b7bb9', hoverColor: '#398ece' },
  { id: 'red', label: 'Rojo', color: '#c53929', hoverColor: '#d84a39' },
  { id: 'purple', label: 'Lila', color: '#a855f7', hoverColor: '#c084fc' },
  {
    id: 'rgb',
    label: 'RGB',
    color: 'conic-gradient(from 0deg, #ff0000, #ff7700, #ffff00, #00ff00, #00ffff, #0000ff, #8a2be2, #ff00aa, #ff0000)',
    hoverColor: '#ec4899',
    isRgb: true,
  },
  { id: 'custom', label: 'Personalizado', color: '#8b5cf6', hoverColor: '#a78bfa', isCustom: true },
];

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'gray',
    label: 'Gris Claro',
    charcoal: '#2b2d2f',
    surface: '#343638',
    surfacePanel: '#3c3e40',
    border: '#4a4c4e',
    cream: '#f5f2eb',
  },
  {
    id: 'dark_gray',
    label: 'Gris Oscuro',
    charcoal: '#1c1d1f',
    surface: '#242628',
    surfacePanel: '#2d3033',
    border: '#383b3e',
    cream: '#f5f2eb',
  },
  {
    id: 'black',
    label: 'Negro',
    charcoal: '#0e0f10',
    surface: '#161719',
    surfacePanel: '#1f2124',
    border: '#2b2d30',
    cream: '#ffffff',
  },
  {
    id: 'gruvbox',
    label: 'Gruvbox',
    charcoal: '#282828',
    surface: '#32302f',
    surfacePanel: '#3c3836',
    border: '#504945',
    cream: '#ebdbb2',
  },
  {
    id: 'nord',
    label: 'Nord',
    charcoal: '#242933',
    surface: '#2e3440',
    surfacePanel: '#3b4252',
    border: '#4c566a',
    cream: '#eceff4',
  },
  {
    id: 'tokyonight',
    label: 'Tokyo Night',
    charcoal: '#1a1b26',
    surface: '#24283b',
    surfacePanel: '#2f3549',
    border: '#414868',
    cream: '#c0caf5',
  },
  {
    id: 'white',
    label: 'Blanco',
    charcoal: '#f3f4f6',
    surface: '#ffffff',
    surfacePanel: '#e5e7eb',
    border: '#cbd2d9',
    cream: '#1a1c1e',
    isLight: true,
  },
  {
    id: 'gray_gradient',
    label: 'Gris Dinámico',
    charcoal: '#282b2e',
    surface: '#33363a',
    surfacePanel: '#3d4146',
    border: '#4d525a',
    cream: '#f5f2eb',
  },
  {
    id: 'custom',
    label: 'Personalizado',
    charcoal: '#1e2124',
    surface: '#282b30',
    surfacePanel: '#36393e',
    border: '#4a4f56',
    cream: '#f5f2eb',
    isCustom: true,
  },
];

const ACCENT_STORAGE_KEY = 'audio_converter_accent';
const THEME_STORAGE_KEY = 'audio_converter_theme';
const CUSTOM_ACCENT_STORAGE_KEY = 'audio_converter_custom_accent';
const CUSTOM_THEME_STORAGE_KEY = 'audio_converter_custom_theme';

export function getCustomAccentColor(): string {
  if (typeof window === 'undefined') return '#8b5cf6';
  return localStorage.getItem(CUSTOM_ACCENT_STORAGE_KEY) || '#8b5cf6';
}

export function setCustomAccentColor(color: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_ACCENT_STORAGE_KEY, color);
}

export function getCustomThemeColor(): string {
  if (typeof window === 'undefined') return '#1e2124';
  return localStorage.getItem(CUSTOM_THEME_STORAGE_KEY) || '#1e2124';
}

export function setCustomThemeColor(color: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_THEME_STORAGE_KEY, color);
}

export type CornerRadius = 'square' | 'industrial' | 'modern' | 'smooth';

const BG_OPACITY_STORAGE_KEY = 'audio_converter_bg_opacity';
const NEON_GLOW_STORAGE_KEY = 'audio_converter_neon_glow';
const NEON_GLOW_INTENSITY_KEY = 'audio_converter_neon_glow_intensity';
const TINTED_BORDERS_KEY = 'audio_converter_tinted_borders';
const TINTED_BORDERS_RATIO_KEY = 'audio_converter_tinted_borders_ratio';
const CORNER_RADIUS_KEY = 'audio_converter_corner_radius';
const AMBIENT_GLOW_KEY = 'audio_converter_ambient_glow';
const MINIMAL_SCROLLBARS_KEY = 'audio_converter_minimal_scrollbars';

export function getSavedBgOpacity(): number {
  if (typeof window === 'undefined') return 1;
  const saved = localStorage.getItem(BG_OPACITY_STORAGE_KEY);
  if (saved !== null) {
    const val = parseFloat(saved);
    if (!isNaN(val) && val >= 0.1 && val <= 1) return val;
  }
  return 1;
}

export function setSavedBgOpacity(opacity: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BG_OPACITY_STORAGE_KEY, opacity.toString());
}

export function getSavedNeonGlow(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(NEON_GLOW_STORAGE_KEY) === 'true';
}

export function setSavedNeonGlow(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NEON_GLOW_STORAGE_KEY, enabled ? 'true' : 'false');
}

export function getSavedNeonGlowIntensity(): number {
  if (typeof window === 'undefined') return 0.6;
  const saved = localStorage.getItem(NEON_GLOW_INTENSITY_KEY);
  if (saved !== null) {
    const val = parseFloat(saved);
    if (!isNaN(val) && val >= 0 && val <= 1) return val;
  }
  return 0.6;
}

export function setSavedNeonGlowIntensity(val: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NEON_GLOW_INTENSITY_KEY, val.toString());
}

export function getSavedTintedBorders(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(TINTED_BORDERS_KEY) === 'true';
}

export function setSavedTintedBorders(val: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TINTED_BORDERS_KEY, val ? 'true' : 'false');
}

export function getSavedTintedBordersRatio(): number {
  if (typeof window === 'undefined') return 0.35;
  const saved = localStorage.getItem(TINTED_BORDERS_RATIO_KEY);
  if (saved !== null) {
    const val = parseFloat(saved);
    if (!isNaN(val) && val >= 0.05 && val <= 1) return val;
  }
  return 0.35;
}

export function setSavedTintedBordersRatio(val: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TINTED_BORDERS_RATIO_KEY, val.toString());
}

export function getSavedCornerRadius(): CornerRadius {
  if (typeof window === 'undefined') return 'modern';
  const saved = localStorage.getItem(CORNER_RADIUS_KEY) as CornerRadius;
  return saved === 'square' || saved === 'industrial' || saved === 'modern' || saved === 'smooth' ? saved : 'modern';
}

export function setSavedCornerRadius(val: CornerRadius) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CORNER_RADIUS_KEY, val);
}

export function getSavedAmbientGlow(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AMBIENT_GLOW_KEY) === 'true';
}

export function setSavedAmbientGlow(val: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AMBIENT_GLOW_KEY, val ? 'true' : 'false');
}

// Deprecated compatibility
export function getSavedVinylGrain(): boolean {
  return false;
}

export function setSavedVinylGrain(_val: boolean) {}

export function getSavedMinimalScrollbars(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(MINIMAL_SCROLLBARS_KEY) === 'true';
}

export function setSavedMinimalScrollbars(val: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MINIMAL_SCROLLBARS_KEY, val ? 'true' : 'false');
}

export function getSavedAccent(): AccentColor {
  if (typeof window === 'undefined') return 'green';
  const saved = localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor;
  return ACCENT_OPTIONS.some((o) => o.id === saved) ? saved : 'green';
}

export function getSavedTheme(): BackgroundTheme {
  if (typeof window === 'undefined') return 'gray';
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as any;
  if (saved === 'dracula') return 'gray_gradient';
  return THEME_OPTIONS.some((o) => o.id === saved) ? saved : 'gray';
}

// Color brightness math helpers
function clamp(val: number, min = 0, max = 255): number {
  return Math.max(min, Math.min(max, val));
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16),
    ];
  }
  return [
    parseInt(clean.slice(0, 2), 16) || 0,
    parseInt(clean.slice(2, 4), 16) || 0,
    parseInt(clean.slice(4, 6), 16) || 0,
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function adjustHexBrightness(hex: string, delta: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(clamp(r + delta), clamp(g + delta), clamp(b + delta));
}

function isHexLight(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55;
}

// Global animation references on window so closures across HMR or multiple calls can never leak
if (typeof window !== 'undefined') {
  if ((window as any).__soundix_rgb_anim_id) {
    cancelAnimationFrame((window as any).__soundix_rgb_anim_id);
    (window as any).__soundix_rgb_anim_id = null;
  }
  if ((window as any).__soundix_bg_anim_id) {
    cancelAnimationFrame((window as any).__soundix_bg_anim_id);
    (window as any).__soundix_bg_anim_id = null;
  }
}

let currentRgbHue = 0;

function startRgbAnimation() {
  if (typeof window === 'undefined') return;
  (window as any).__soundix_rgb_active = true;
  if ((window as any).__soundix_rgb_anim_id) return;
  let lastTime = performance.now();
  const step = (time: number) => {
    if (typeof window === 'undefined' || !(window as any).__soundix_rgb_active) {
      if ((window as any).__soundix_rgb_anim_id) {
        cancelAnimationFrame((window as any).__soundix_rgb_anim_id);
        (window as any).__soundix_rgb_anim_id = null;
      }
      return;
    }
    const delta = Math.min(time - lastTime, 100);
    lastTime = time;
    currentRgbHue = (currentRgbHue + (delta * 0.04)) % 360;
    const activeColor = `hsl(${currentRgbHue.toFixed(1)}, 85%, 56%)`;
    const activeHover = `hsl(${currentRgbHue.toFixed(1)}, 90%, 65%)`;
    const root = document.documentElement;
    root.style.setProperty('--color-olive', activeColor);
    root.style.setProperty('--color-olive-hover', activeHover);
    root.style.setProperty('--app-accent', activeColor);
    root.style.setProperty('--app-accent-hover', activeHover);
    (window as any).__soundix_rgb_anim_id = requestAnimationFrame(step);
  };
  (window as any).__soundix_rgb_anim_id = requestAnimationFrame(step);
}

function stopRgbAnimation() {
  if (typeof window !== 'undefined') {
    (window as any).__soundix_rgb_active = false;
    if ((window as any).__soundix_rgb_anim_id) {
      cancelAnimationFrame((window as any).__soundix_rgb_anim_id);
      (window as any).__soundix_rgb_anim_id = null;
    }
  }
}

let currentBgOpacityVal = 1;

function startBgGradientAnimation(bgOpacityVal?: number) {
  if (typeof window === 'undefined') return;
  (window as any).__soundix_bg_active = true;
  currentBgOpacityVal = bgOpacityVal !== undefined ? bgOpacityVal : getSavedBgOpacity();
  if ((window as any).__soundix_bg_anim_id) return;
  let startTime = performance.now();
  const step = (time: number) => {
    if (typeof window === 'undefined' || !(window as any).__soundix_bg_active) {
      if ((window as any).__soundix_bg_anim_id) {
        cancelAnimationFrame((window as any).__soundix_bg_anim_id);
        (window as any).__soundix_bg_anim_id = null;
      }
      return;
    }
    const elapsed = (time - startTime) / 1000;
    // Smooth breathing sine cycle over 8.5 seconds
    const progress = (Math.sin(elapsed * (Math.PI * 2 / 8.5)) + 1) / 2; // 0..1

    // Dark bounds: rgb(22, 23, 25)  -> Light bounds: rgb(58, 61, 66)
    const rCharcoal = Math.round(22 + (58 - 22) * progress);
    const gCharcoal = Math.round(23 + (61 - 23) * progress);
    const bCharcoal = Math.round(25 + (66 - 25) * progress);

    const rSurface = Math.round(30 + (70 - 30) * progress);
    const gSurface = Math.round(32 + (73 - 32) * progress);
    const bSurface = Math.round(35 + (78 - 35) * progress);

    const rPanel = Math.round(40 + (82 - 40) * progress);
    const gPanel = Math.round(42 + (86 - 42) * progress);
    const bPanel = Math.round(46 + (92 - 46) * progress);

    const rBorder = Math.round(56 + (102 - 56) * progress);
    const gBorder = Math.round(59 + (106 - 59) * progress);
    const bBorder = Math.round(64 + (114 - 64) * progress);

    const root = document.documentElement;
    const op = currentBgOpacityVal;

    if (op < 0.99) {
      root.style.setProperty('--color-charcoal', `rgba(${rCharcoal}, ${gCharcoal}, ${bCharcoal}, ${op.toFixed(2)})`);
      root.style.setProperty('--color-surface', `rgba(${rSurface}, ${gSurface}, ${bSurface}, ${Math.min(1, op + 0.04).toFixed(2)})`);
      root.style.setProperty('--color-surface-panel', `rgba(${rPanel}, ${gPanel}, ${bPanel}, ${Math.min(1, op + 0.08).toFixed(2)})`);
      root.style.setProperty('--app-bg', `rgba(${rCharcoal}, ${gCharcoal}, ${bCharcoal}, ${op.toFixed(2)})`);
      root.style.setProperty('--app-surface', `rgba(${rSurface}, ${gSurface}, ${bSurface}, ${Math.min(1, op + 0.04).toFixed(2)})`);
      root.style.setProperty('--app-surface2', `rgba(${rPanel}, ${gPanel}, ${bPanel}, ${Math.min(1, op + 0.08).toFixed(2)})`);
    } else {
      root.style.setProperty('--color-charcoal', `rgb(${rCharcoal}, ${gCharcoal}, ${bCharcoal})`);
      root.style.setProperty('--color-surface', `rgb(${rSurface}, ${gSurface}, ${bSurface})`);
      root.style.setProperty('--color-surface-panel', `rgb(${rPanel}, ${gPanel}, ${bPanel})`);
      root.style.setProperty('--app-bg', `rgb(${rCharcoal}, ${gCharcoal}, ${bCharcoal})`);
      root.style.setProperty('--app-surface', `rgb(${rSurface}, ${gSurface}, ${bSurface})`);
      root.style.setProperty('--app-surface2', `rgb(${rPanel}, ${gPanel}, ${bPanel})`);
    }

    const currentTinted = getSavedTintedBorders();
    if (currentTinted) {
      const baseBorderHex = rgbToHex(rBorder, gBorder, bBorder);
      const activeColor = root.style.getPropertyValue('--color-olive') || '#556b2f';
      const tintRatio = getSavedTintedBordersRatio();
      root.style.setProperty('--color-border', blendColors(baseBorderHex, activeColor, tintRatio));
    } else {
      root.style.setProperty('--color-border', `rgb(${rBorder}, ${gBorder}, ${bBorder})`);
    }
    root.style.setProperty('--app-border', root.style.getPropertyValue('--color-border'));

    (window as any).__soundix_bg_anim_id = requestAnimationFrame(step);
  };
  (window as any).__soundix_bg_anim_id = requestAnimationFrame(step);
}

function stopBgGradientAnimation() {
  if (typeof window !== 'undefined') {
    (window as any).__soundix_bg_active = false;
    if ((window as any).__soundix_bg_anim_id) {
      cancelAnimationFrame((window as any).__soundix_bg_anim_id);
      (window as any).__soundix_bg_anim_id = null;
    }
  }
}

function blendColors(hex1: string, hex2: string, ratio: number): string {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2.startsWith('#') ? hex2 : '#556b2f');
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  return rgbToHex(clamp(r), clamp(g), clamp(b));
}

export function applyTheme(
  accent: AccentColor,
  bg: BackgroundTheme,
  customAccentHex?: string,
  customThemeHex?: string,
  bgOpacity?: number,
  neonGlow?: boolean,
  neonIntensity?: number,
  tintedBorders?: boolean,
  tintedBordersRatio?: number,
  cornerRadius?: CornerRadius,
  ambientGlow?: boolean,
  minimalScrollbars?: boolean,
  vinylGrain?: boolean, // Deprecated alias
) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // 1. Accent color
  let activeColor = '#556b2f';
  let activeHover = '#68833a';

  if (accent === 'rgb') {
    startRgbAnimation();
    root.classList.add('rgb-accent-mode');
    activeColor = `hsl(${currentRgbHue.toFixed(1)}, 85%, 56%)`;
    activeHover = `hsl(${currentRgbHue.toFixed(1)}, 90%, 65%)`;
  } else {
    stopRgbAnimation();
    root.classList.remove('rgb-accent-mode');
    if (accent === 'custom') {
      const customHex = customAccentHex || getCustomAccentColor();
      activeColor = customHex;
      activeHover = adjustHexBrightness(customHex, 20);
    } else {
      const accentOpt = ACCENT_OPTIONS.find((a) => a.id === accent) || ACCENT_OPTIONS[0];
      activeColor = accentOpt.color;
      activeHover = accentOpt.hoverColor;
    }
  }

  root.style.setProperty('--color-olive', activeColor);
  root.style.setProperty('--color-olive-hover', activeHover);
  root.setAttribute('data-accent', accent);
  localStorage.setItem(ACCENT_STORAGE_KEY, accent);

  // 2. Background Theme & Breathing Gray Animation
  let charcoal = '#2b2d2f';
  let surface = '#343638';
  let surfacePanel = '#3c3e40';
  let border = '#4a4c4e';
  let cream = '#f5f2eb';
  let isLight = false;

  const currentOpacity = bgOpacity !== undefined ? bgOpacity : getSavedBgOpacity();
  setSavedBgOpacity(currentOpacity);

  if (bg === 'gray_gradient') {
    startBgGradientAnimation(currentOpacity);
  } else {
    stopBgGradientAnimation();
  }

  if (bg === 'custom') {
    const base = customThemeHex || getCustomThemeColor();
    isLight = isHexLight(base);
    charcoal = base;
    surface = adjustHexBrightness(base, isLight ? -10 : 12);
    surfacePanel = adjustHexBrightness(base, isLight ? -18 : 22);
    border = adjustHexBrightness(base, isLight ? -35 : 38);
    cream = isLight ? '#1a1c1e' : '#f8f8f2';
  } else {
    const themeOpt = THEME_OPTIONS.find((t) => t.id === bg) || THEME_OPTIONS[0];
    charcoal = themeOpt.charcoal;
    surface = themeOpt.surface;
    surfacePanel = themeOpt.surfacePanel;
    border = themeOpt.border;
    cream = themeOpt.cream;
    isLight = !!themeOpt.isLight;
  }

  // 3. Background Transparency & Glass Effect
  let finalCharcoal = charcoal;
  let finalSurface = surface;
  let finalSurfacePanel = surfacePanel;

  if (currentOpacity < 0.99) {
    const [cr, cg, cb] = hexToRgb(charcoal);
    const [sr, sg, sb] = hexToRgb(surface);
    const [pr, pg, pb] = hexToRgb(surfacePanel);
    finalCharcoal = `rgba(${cr}, ${cg}, ${cb}, ${currentOpacity.toFixed(2)})`;
    finalSurface = `rgba(${sr}, ${sg}, ${sb}, ${Math.min(1, currentOpacity + 0.04).toFixed(2)})`;
    finalSurfacePanel = `rgba(${pr}, ${pg}, ${pb}, ${Math.min(1, currentOpacity + 0.08).toFixed(2)})`;
    root.classList.add('glass-effect');
  } else {
    root.classList.remove('glass-effect');
  }

  // 4. Tinted Borders & Ratio
  const currentTintedBorders = tintedBorders !== undefined ? tintedBorders : getSavedTintedBorders();
  const currentTintedRatio = tintedBordersRatio !== undefined ? tintedBordersRatio : getSavedTintedBordersRatio();
  setSavedTintedBorders(currentTintedBorders);
  setSavedTintedBordersRatio(currentTintedRatio);

  let finalBorder = border;
  if (currentTintedBorders) {
    finalBorder = blendColors(border, activeColor, currentTintedRatio);
  }

  if (bg !== 'gray_gradient') {
    root.style.setProperty('--color-charcoal', finalCharcoal);
    root.style.setProperty('--color-surface', finalSurface);
    root.style.setProperty('--color-surface-panel', finalSurfacePanel);
    root.style.setProperty('--color-border', finalBorder);
  }
  root.style.setProperty('--color-cream', cream);
  root.style.setProperty('--bg-opacity', currentOpacity.toString());

  // Also synchronize --app-* CSS variables for MusicX components
  root.style.setProperty('--app-accent', activeColor);
  root.style.setProperty('--app-accent-hover', activeHover);
  root.style.setProperty('--app-bg', finalCharcoal);
  root.style.setProperty('--app-surface', finalSurface);
  root.style.setProperty('--app-surface2', finalSurfacePanel);
  root.style.setProperty('--app-border', finalBorder);
  root.style.setProperty('--app-text', cream);
  root.style.setProperty('--app-muted', isLight ? '#5b6470' : '#9ca3af');

  // 5. Neon Glow & Scaled Intensity
  const currentGlow = neonGlow !== undefined ? neonGlow : getSavedNeonGlow();
  const currentIntensity = neonIntensity !== undefined ? neonIntensity : getSavedNeonGlowIntensity();
  setSavedNeonGlow(currentGlow);
  setSavedNeonGlowIntensity(currentIntensity);

  if (currentGlow && currentIntensity > 0) {
    root.classList.add('neon-glow-active');
    const effectiveIntensity = currentIntensity * 0.40;
    const glowRadius = Math.round(effectiveIntensity * 28);
    const glowSpread = Math.round(effectiveIntensity * 6);
    root.style.setProperty('--neon-glow-radius', `${glowRadius}px`);
    root.style.setProperty('--neon-glow-spread', `${glowSpread}px`);
  } else {
    root.classList.remove('neon-glow-active');
    root.style.setProperty('--neon-glow-radius', '0px');
    root.style.setProperty('--neon-glow-spread', '0px');
  }

  // 6. Corner Radius
  const currentRadius = cornerRadius !== undefined ? cornerRadius : getSavedCornerRadius();
  setSavedCornerRadius(currentRadius);
  root.setAttribute('data-radius', currentRadius);
  const radiusPx = currentRadius === 'square' ? 0 : currentRadius === 'industrial' ? 4 : currentRadius === 'modern' ? 8 : 14;
  root.style.setProperty('--app-radius', `${radiusPx}px`);
  root.style.setProperty('--app-corner-radius', `${radiusPx}px`);

  // 7. Ambient Studio Glow
  const currentAmbient =
    ambientGlow !== undefined
      ? ambientGlow
      : vinylGrain !== undefined
      ? vinylGrain
      : getSavedAmbientGlow();
  setSavedAmbientGlow(currentAmbient);
  if (currentAmbient) {
    root.classList.add('ambient-glow-active');
  } else {
    root.classList.remove('ambient-glow-active');
  }

  // 8. Minimal Scrollbars
  const currentScrollbars = minimalScrollbars !== undefined ? minimalScrollbars : getSavedMinimalScrollbars();
  setSavedMinimalScrollbars(currentScrollbars);
  if (currentScrollbars) {
    root.classList.add('minimal-scrollbars');
  } else {
    root.classList.remove('minimal-scrollbars');
  }

  root.setAttribute('data-theme', bg);
  root.style.colorScheme = isLight ? 'light' : 'dark';
  if (isLight) {
    root.classList.add('light-mode');
  } else {
    root.classList.remove('light-mode');
  }
  localStorage.setItem(THEME_STORAGE_KEY, bg);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('app-accent-changed', {
        detail: {
          accent,
          color: activeColor,
          hoverColor: activeHover,
          theme: bg,
          opacity: currentOpacity,
          glow: currentGlow,
          intensity: currentIntensity,
          tintedBorders: currentTintedBorders,
          tintedBordersRatio: currentTintedRatio,
          radius: currentRadius,
          ambientGlow: currentAmbient,
          scrollbars: currentScrollbars,
        },
      }),
    );
  }
}

export function initTheme() {
  applyTheme(
    getSavedAccent(),
    getSavedTheme(),
    undefined,
    undefined,
    getSavedBgOpacity(),
    getSavedNeonGlow(),
    getSavedNeonGlowIntensity(),
    getSavedTintedBorders(),
    getSavedTintedBordersRatio(),
    getSavedCornerRadius(),
    getSavedAmbientGlow(),
    getSavedMinimalScrollbars()
  );
}

if (import.meta && (import.meta as any).hot) {
  (import.meta as any).hot.dispose(() => {
    stopRgbAnimation();
    stopBgGradientAnimation();
  });
}
