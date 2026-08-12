/**
 * adds a chunk-order helper.
 */
export function chunkOrder(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

