
/**
 * adds a whitespace collapser.
 */
export function collapseWhitespace(text) {
  return String(text).replace(/\s+/g, ' ');
}

