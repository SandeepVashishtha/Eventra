/**
 * adds a build-chunk helper.
 */
export function buildChunk(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

