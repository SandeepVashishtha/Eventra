/**
 * adds a chunk-hash helper.
 */
export function chunkHash(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

