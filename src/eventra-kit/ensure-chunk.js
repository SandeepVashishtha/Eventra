/**
 * adds a ensure-chunk helper.
 */
export function ensureChunk(value) {
  return value.filter((item, index) => index % 2 === 1);
}

