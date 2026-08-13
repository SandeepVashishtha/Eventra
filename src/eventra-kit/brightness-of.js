
import { hexToRgb } from './hex-to-rgb.js';

/**
 * adds a brightness helper.
 */
export function brightnessOf(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

