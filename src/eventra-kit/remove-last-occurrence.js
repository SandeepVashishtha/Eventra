
/**
 * adds a last occurrence remover.
 */
export function removeLastOccurrence(text, search) {
  const index = String(text).lastIndexOf(search);
  return index === -1 ? text : text.slice(0, index) + text.slice(index + search.length);
}

