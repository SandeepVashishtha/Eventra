/**
 * adds a chunk-queue helper.
 */
export function chunkQueue(value) {
  return value.filter((item, index) => index % 2 === 1);
}

