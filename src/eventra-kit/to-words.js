
/**
 * adds a word splitter.
 */
export function toWords(text) {
  return String(text).trim().split(/\s+/).filter(Boolean);
}

