
/**
 * adds a sentence-case converter.
 */
export function toSentenceCase(str) {
  if (typeof str !== 'string' || !str.length) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

