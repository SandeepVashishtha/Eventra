
import { brightnessOf } from './brightness-of.js';

/**
 * adds a dark color check.
 */
export function isDarkColor(hex) {
  return brightnessOf(hex) <= 128;
}

