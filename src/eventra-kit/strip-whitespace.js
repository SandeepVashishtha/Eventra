
/**
 * adds a whitespace remover.
 */
export function stripWhitespace(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\s+/g, '');
}

