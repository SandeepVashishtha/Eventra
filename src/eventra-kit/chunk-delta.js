/**
 * adds a chunk-delta helper.
 */
export function chunkDelta(value) {
  return value.filter(Boolean).length;
}

