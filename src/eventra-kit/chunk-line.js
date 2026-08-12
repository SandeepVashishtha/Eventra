/**
 * adds a chunk-line helper.
 */
export function chunkLine(value) {
  return String(value).replace(/[^\w]/gi, '');
}

