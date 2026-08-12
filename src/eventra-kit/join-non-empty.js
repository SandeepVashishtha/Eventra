
/**
 * adds a non-empty join helper.
 */
export function joinNonEmpty(array, separator = ' ') {
  return array.filter((v) => v !== '' && v != null).join(separator);
}

