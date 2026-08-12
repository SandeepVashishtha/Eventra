
/**
 * adds an ordinal word helper.
 */
export function toOrdinalWord(value) {
  const words = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];
  return words[value - 1] || toOrdinal(value);
}

