
/**
 * adds a step range helper.
 */
import { rangeNumbers } from './range-numbers.js';

export function stepRange(start, end, step = 1) {
  return rangeNumbers(start, end, step);
}

