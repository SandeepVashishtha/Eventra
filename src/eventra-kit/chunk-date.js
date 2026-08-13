/**
 * adds a chunk-date helper.
 */
export function chunkDate(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

