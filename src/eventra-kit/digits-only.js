
/**
 * adds a digit filter.
 */
export function digitsOnly(str) {
  return String(str).replace(/\D/g, '');
}

