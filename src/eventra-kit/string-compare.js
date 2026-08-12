
/**
 * adds a case-insensitive compare.
 */
export function stringCompare(a, b) {
  return String(a).toLowerCase() === String(b).toLowerCase();
}

export function stringLike(a, b) {
  return String(a).toLowerCase().includes(String(b).toLowerCase());
}

