
import { brightnessOf } from './brightness-of.js';

/**
 * adds a light color check.
 */
export function isLightColor(hex) {
  return brightnessOf(hex) > 128;
}

