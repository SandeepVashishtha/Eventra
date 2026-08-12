
/**
 * adds a punctuation stripper.
 */
export function stripPunctuation(text) {
  return String(text).replace(/[^\w\s]/g, '');
}

