
/**
 * adds a shortest-word helper.
 */
export function shortestWord(text) {
  const words = String(text).split(/\s+/).filter(Boolean);
  return words.reduce((best, w) => (w.length < best.length ? w : best), words[0] ?? '');
}

