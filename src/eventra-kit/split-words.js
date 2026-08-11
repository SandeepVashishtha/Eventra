
/**
 * adds a word splitter.
 */
export function splitWords(str) {
  return String(str).split(/[\s_-]+/).filter(Boolean);
}

