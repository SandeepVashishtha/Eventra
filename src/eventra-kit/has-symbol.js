
/**
 * adds a symbol check.
 */
export function hasSymbol(text) {
  return /[^\w\s]/.test(text);
}

