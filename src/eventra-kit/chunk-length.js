/**
 * adds a chunk-length helper.
 */
export function chunkLength(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

