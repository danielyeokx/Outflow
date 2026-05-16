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
