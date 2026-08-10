
/**
 * adds a whitespace check.
 */
export function isWhitespace(text) {
  return typeof text === 'string' && text.trim().length === 0;
}

