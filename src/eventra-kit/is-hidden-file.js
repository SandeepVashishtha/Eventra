
/**
 * adds a hidden file check.
 */
export function isHiddenFile(filename) {
  return String(filename).startsWith('.');
}

