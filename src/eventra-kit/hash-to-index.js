import { hashStringToNumber } from './hash-string-to-number.js';

/**
 * adds a hash index helper.
 */
import { hashStringToNumber } from './hash-string-to-number.js';

export function hashToIndex(text, bucketCount) {
  return hashStringToNumber(text) % bucketCount;
}

