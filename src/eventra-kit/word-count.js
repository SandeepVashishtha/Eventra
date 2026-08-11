
/**
 * adds a word counter.
 */
export function wordCount(text) {
  if (typeof text !== 'string') return 0;
  const words = text.trim().split(/\s+/);
  return words[0] === '' ? 0 : words.length;
}

