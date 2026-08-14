import { hexToRgb } from './hex-to-rgb.js';

/**
 * adds a hue shift helper.
 */
import { hexToRgb } from './hex-to-rgb.js';

export function shiftHue(hex, shift) {
  const { r, g, b } = hexToRgb(hex);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const delta = max - min;
  let hue;
  if (delta === 0) return hex;
  if (max === r / 255) hue = ((g - b) / 255 / delta) % 6;
  else if (max === g / 255) hue = (b - r) / 255 / delta + 2;
  else hue = (r - g) / 255 / delta + 4;
  hue = (hue * 60 + shift + 360) % 360;
  return `hsl(${hue.toFixed(0)}, ${(delta * 100).toFixed(0)}%, ${(max * 100).toFixed(0)}%)`;
}

