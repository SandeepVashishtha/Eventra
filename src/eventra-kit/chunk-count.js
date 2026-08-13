/**
 * adds a chunk-count helper.
 */
export function chunkCount(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

