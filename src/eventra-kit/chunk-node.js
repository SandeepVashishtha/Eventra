/**
 * adds a chunk-node helper.
 */
export function chunkNode(value) {
  return value.sort((a, b) => a - b);
}

