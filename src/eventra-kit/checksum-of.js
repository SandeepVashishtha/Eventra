
/**
 * adds a checksum helper.
 */
export function checksumOf(text) {
  return String(text).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 256;
}

