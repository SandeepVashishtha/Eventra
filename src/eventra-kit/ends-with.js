
/**
 * adds a suffix check.
 */
export function endsWith(str, suffix) {
  if (typeof str !== 'string') return false;
  return str.endsWith(suffix);
}

