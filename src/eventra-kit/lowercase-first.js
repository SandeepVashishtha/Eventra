
/**
 * adds a first-char lowercaser.
 */
export function lowercaseFirst(str) {
  if (typeof str !== 'string' || !str.length) return str;
  return str.charAt(0).toLowerCase() + str.slice(1);
}

