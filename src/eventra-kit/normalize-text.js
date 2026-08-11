
/**
 * adds a text normalizer.
 */
export function normalizeText(text) {
  return String(text).toLowerCase().trim().replace(/\s+/g, ' ');
}

