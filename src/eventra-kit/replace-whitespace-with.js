
/**
 * adds a whitespace replacer.
 */
export function replaceWhitespaceWith(text, replacement) {
  return String(text).replace(/\s+/g, replacement);
}

