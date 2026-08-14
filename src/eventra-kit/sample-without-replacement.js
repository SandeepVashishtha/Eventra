
/**
 * adds a no-replacement sampler.
 */
import { randomSubset } from './random-subset.js';

export function sampleWithoutReplacement(array, size) {
  return randomSubset(array, size);
}

