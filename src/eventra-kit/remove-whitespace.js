
/**
 * adds a whitespace remover.
 */
export function removeWhitespace(text) {
  return String(text).replace(/\s+/g, '');
}

