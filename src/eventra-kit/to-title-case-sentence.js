/**
 * adds a sentence case helper.
 */
export function toTitleCaseSentence(str) {
  if (typeof str !== 'string') return '';
  const words = str.toLowerCase().split(/\s+/);
  const small = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'for', 'to', 'with']);
  return words.map((w, i) => {
    if (i !== 0 && small.has(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}
