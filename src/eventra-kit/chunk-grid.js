/**
 * adds a chunk-grid helper.
 */
export function chunkGrid(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

