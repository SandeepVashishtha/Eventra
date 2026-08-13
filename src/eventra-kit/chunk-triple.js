/**
 * adds a chunk-triple helper.
 */
export function chunkTriple(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

