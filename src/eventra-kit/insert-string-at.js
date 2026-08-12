
/**
 * adds a string inserter.
 */
export function insertStringAt(text, index, insert) {
  return text.slice(0, index) + insert + text.slice(index);
}

