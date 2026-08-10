
/**
 * adds a longest-word helper.
 */
export function longestWord(text) {
  return String(text).split(/\s+/).filter(Boolean).reduce((best, w) => (w.length > best.length ? w : best), '');
}

