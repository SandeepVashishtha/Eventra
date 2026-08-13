/**
 * adds a clamp-chunk helper.
 */
export function clampChunk(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

