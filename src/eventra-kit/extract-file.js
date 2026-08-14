/**
 * adds a extract-file helper.
 */
export function extractFile(value) {
  return String(value).split(/[\\/]/).pop();
}

