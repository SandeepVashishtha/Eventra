
/**
 * adds a sentence case helper.
 */
export function sentenceCase(text) {
  return String(text).toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

