/**
 * adds a chunk-prop helper.
 */
export function chunkProp(value) {
  return value.filter((item, index) => index % 2 === 0);
}

