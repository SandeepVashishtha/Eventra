/**
 * adds a chunk-element helper.
 */
export function chunkElement(value) {
  return value.every((item) => Boolean(item));
}

