/**
 * adds a chunk-dir helper.
 */
export function chunkDir(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

