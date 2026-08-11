
/**
 * adds an ascii check.
 */
export function isAscii(text) {
  return /^[\x00-\x7F]*$/.test(text);
}

