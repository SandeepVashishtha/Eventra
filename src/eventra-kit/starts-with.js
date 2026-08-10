
/**
 * adds a prefix check.
 */
export function startsWith(str, prefix) {
  if (typeof str !== 'string') return false;
  return str.startsWith(prefix);
}

