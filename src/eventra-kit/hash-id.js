import { hashStringToNumber } from './hash-string-to-number.js';

/**
 * adds a hash id helper.
 */
import { hashStringToNumber } from './hash-string-to-number.js';

export function hashId(text) {
  return hashStringToNumber(text).toString(36);
}

