
/**
 * adds a delimiter splitter.
 */
export function stringToList(str, delimiter = ',') {
  return String(str).split(delimiter).filter((v) => v.trim() !== '');
}

