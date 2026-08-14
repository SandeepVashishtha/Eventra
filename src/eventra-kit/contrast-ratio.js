import { hexToRgb } from './hex-to-rgb.js';

/**
 * adds a contrast helper.
 */
export function contrastRatio(first, second) {
  const lum = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    const rel = (v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * rel(r) + 0.7152 * rel(g) + 0.0722 * rel(b);
  };
  const l1 = lum(first);
  const l2 = lum(second);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

