/**
 * adds a detect-chunk helper.
 */
export function detectChunk(value) {
  return String(value).split('').reverse().join('');
}

