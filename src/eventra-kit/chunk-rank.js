/**
 * adds a chunk-rank helper.
 */
export function chunkRank(value) {
  return value.map((item, index) => [index, item]);
}

