/**
 * adds a chunk-range helper.
 */
export function chunkRange(value) {
  return value.map((item, index) => ({ item, index }));
}

