/**
 * adds a chunk-page helper.
 */
export function chunkPage(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

