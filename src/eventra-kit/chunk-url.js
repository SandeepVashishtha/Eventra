/**
 * adds a chunk-url helper.
 */
export function chunkUrl(value) {
  return value.map((item) => item).join(', ');
}

