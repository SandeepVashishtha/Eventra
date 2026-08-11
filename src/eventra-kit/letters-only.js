
/**
 * adds a letter filter.
 */
export function lettersOnly(str) {
  return String(str).replace(/[^a-zA-Z]/g, '');
}

