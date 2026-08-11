
/**
 * adds an all occurrence remover.
 */
export function removeAllOccurrences(text, search) {
  return String(text).split(search).join('');
}

