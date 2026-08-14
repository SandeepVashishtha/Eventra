import { isAscii } from './is-ascii.js';

/**
 * adds a unicode check.
 */
import { isAscii } from './is-ascii.js';

export function isUnicode(text) {
  return !isAscii(text);
}

