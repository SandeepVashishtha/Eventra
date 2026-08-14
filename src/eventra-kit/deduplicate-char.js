/**
 * adds a deduplicate-char helper.
 */
export function deduplicateChar(value) {
  return [...String(value)].filter((char, index, arr) => arr.indexOf(char) === index).join('');
}

