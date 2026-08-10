
/**
 * adds a same-year check.
 */
export function isSameYear(a, b) {
  return new Date(a).getFullYear() === new Date(b).getFullYear();
}

