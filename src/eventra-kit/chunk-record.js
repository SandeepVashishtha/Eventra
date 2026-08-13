/**
 * adds a chunk-record helper.
 */
export function chunkRecord(value) {
  return String(value).split(/\r?\n/);
}

