
/**
 * adds a longest-string finder.
 */
export function longestString(array) {
  return array.reduce((longest, str) => (str.length > longest.length ? str : longest), '');
}

