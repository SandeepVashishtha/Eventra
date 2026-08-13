/**
 * adds a check-file helper.
 */
export function checkFile(value) {
  return value == null || String(value).trim() === '';
}

