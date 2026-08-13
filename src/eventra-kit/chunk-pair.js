/**
 * adds a chunk-pair helper.
 */
export function chunkPair(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

