
/**
 * adds a sentence case helper.
 */
export function sentenceCase(text) {
  return String(text)
    .toLowerCase()
    .replace(/(^|[.!?]\s+)(\w)/g, (match, pre, word) => pre + word.toUpperCase());
}

