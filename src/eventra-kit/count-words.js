
/**
 * adds a word counter.
 */
export function countWords(text) {
  const words = String(text).trim().split(/\s+/);
  return words[0] === '' ? 0 : words.length;
}

