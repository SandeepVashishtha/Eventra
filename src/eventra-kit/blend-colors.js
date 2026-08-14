import { hexToRgb } from './hex-to-rgb.js';
import { colorToHex } from './color-to-hex.js';

/**
 * adds a color blend helper.
 */
export function blendColors(first, second, t = 0.5) {
  const a = hexToRgb(first);
  const b = hexToRgb(second);
  return colorToHex(
    Math.round(a.r + (b.r - a.r) * t),
    Math.round(a.g + (b.g - a.g) * t),
    Math.round(a.b + (b.b - a.b) * t)
  );
}

