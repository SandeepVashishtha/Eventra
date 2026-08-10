
/**
 * adds a shortest-word helper.
 */
export function shortestWord(text) {
  return String(text).split(/\s+/).filter(Boolean).reduce((best, w) => (w.length < best.length ? w : best), '');
}

