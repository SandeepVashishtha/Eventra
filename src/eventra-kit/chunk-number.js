/**
 * adds a chunk-number helper.
 */
export function chunkNumber(value) {
  return value.sort((a, b) => b - a);
}

