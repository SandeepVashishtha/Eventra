/**
 * adds a chunk-dict helper.
 */
export function chunkDict(value) {
  return [...new Set(value)];
}

