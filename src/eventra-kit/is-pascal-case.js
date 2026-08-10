
/**
 * adds a pascal case check.
 */
export function isPascalCase(str) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

