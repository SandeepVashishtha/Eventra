
/**
 * adds a sentence starter helper.
 */
export function firstLetterUpper(text) {
  if (typeof text !== 'string' || !text) return text || '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function firstLetterLower(text) {
  if (typeof text !== 'string' || !text) return text || '';
  return text.charAt(0).toLowerCase() + text.slice(1);
}

