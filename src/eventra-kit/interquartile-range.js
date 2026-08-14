
/**
 * adds an IQR helper.
 */
import { percentile } from './percentile.js';

export function interquartileRange(array) {
  const sorted = [...array].sort((a, b) => a - b);
  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);
  return q3 - q1;
}

