
/**
 * adds a hex color converter.
 */
export function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const num = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const value = parseInt(num, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

