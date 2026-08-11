
/**
 * adds a whitespace compressor.
 */
export function compressWhitespace(text) {
  return String(text).replace(/\s+/g, '').trim();
}

