export const T = {
  bg:       '#0A0A0A',
  surface:  '#111111',
  elevated: '#181818',
  border:   '#2A2A2A',
  text: {
    primary:   '#FFFFFF',
    secondary: '#888888',
    muted:     '#444444',
  },
  radius: 4,
  border_width: 1,
} as const;

// Convert any hex color to its grayscale luminance equivalent
export function toGray(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  // Clamp between 80-220 so it's always visible on dark bg
  const clamped = Math.max(80, Math.min(220, gray));
  const h = clamped.toString(16).padStart(2, '0');
  return `#${h}${h}${h}`;
}

// Color theme: applies to category colors throughout the app
export type ColorTheme = 'multi' | 'neutral' | 'warm' | 'cool' | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

export const COLOR_THEMES: { id: ColorTheme; label: string; swatch: string }[] = [
  { id: 'multi',   label: 'MULTI-COLOUR', swatch: '#C3A6FF' },
  { id: 'neutral', label: 'NEUTRAL',      swatch: '#AAAAAA' },
  { id: 'warm',    label: 'WARM',         swatch: '#FF9F40' },
  { id: 'cool',    label: 'COOL',         swatch: '#5C9DFF' },
  { id: 'red',     label: 'RED',          swatch: '#FF6B6B' },
  { id: 'orange',  label: 'ORANGE',       swatch: '#FFA94D' },
  { id: 'yellow',  label: 'YELLOW',       swatch: '#FFD93D' },
  { id: 'green',   label: 'GREEN',        swatch: '#69DB7C' },
  { id: 'blue',    label: 'BLUE',         swatch: '#4DABF7' },
  { id: 'purple',  label: 'PURPLE',       swatch: '#B197FC' },
  { id: 'pink',    label: 'PINK',         swatch: '#FF8FAB' },
];

export function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100, lig = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

// Stable hash of a hex color into a 0..(mod-1) bucket — used to pick a
// consistent shade per category without needing extra stored state
function hashIndex(hex: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < hex.length; i++) h = (h * 31 + hex.charCodeAt(i)) % 1000003;
  return Math.abs(h) % mod;
}

const HUE_RANGES: Record<string, [number, number]> = {
  warm: [0, 45],
  cool: [200, 320],
};

const SINGLE_HUES: Record<string, number> = {
  red: 0, orange: 30, yellow: 50, green: 135, blue: 210, purple: 265, pink: 330,
};

// Order families travel through when picking defaults / hashing shades
const HUE_FAMILY_ORDER: (keyof typeof SINGLE_HUES)[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

// Preset swatches for per-category custom colors — grouped by hue family,
// each family contributing a Light / Base / Dark shade in that order
export const CATEGORY_SWATCHES: string[] = HUE_FAMILY_ORDER.flatMap((family) => {
  const hue = SINGLE_HUES[family];
  return [hslToHex(hue, 65, 70), hslToHex(hue, 65, 55), hslToHex(hue, 65, 40)];
});

const SHADE_BUCKETS = 8;

// Resolve a category's stored color to its display color under the active theme.
// `override` (if set) wins regardless of theme — it's the user's explicit pick.
export function getCategoryColor(hex: string, theme: ColorTheme, override?: string | null): string {
  if (override) return override;
  if (theme === 'multi') return hex;
  if (theme === 'neutral') return toGray(hex);

  const idx = hashIndex(hex, SHADE_BUCKETS);
  if (theme === 'warm' || theme === 'cool') {
    const [start, end] = HUE_RANGES[theme];
    const hue = start + (idx / (SHADE_BUCKETS - 1)) * (end - start);
    return hslToHex(hue, 65, 60);
  }
  const hue = SINGLE_HUES[theme] ?? 0;
  const lightness = 45 + (idx / (SHADE_BUCKETS - 1)) * 30; // 45–75%
  return hslToHex(hue, 65, lightness);
}

// Card style shorthand
export const card = {
  backgroundColor: '#111111',
  borderWidth: 1,
  borderColor: '#2A2A2A',
  borderRadius: 4,
} as const;

// Input style shorthand
export const input = {
  backgroundColor: '#181818',
  borderWidth: 1,
  borderColor: '#2A2A2A',
  borderRadius: 4,
  color: '#FFFFFF',
  fontSize: 14,
  fontFamily: 'SpaceMono-Regular',
  paddingHorizontal: 14,
  paddingVertical: 13,
} as const;
