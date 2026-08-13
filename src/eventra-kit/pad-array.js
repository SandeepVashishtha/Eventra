
/**
 * adds an array padding helper.
 */
export function padArray(array, length, fill) {
  return array.length >= length ? array.slice(0, length) : array.concat(fillArray(length - array.length, fill));
}

