
/**
 * adds a text range remover.
 */
export function removeRangeText(str, start, end) {
  return str.slice(0, start) + str.slice(end);
}

