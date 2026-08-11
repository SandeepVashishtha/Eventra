
/**
 * adds a left rotation helper.
 */
export function rotateLeft(array, count = 1) {
  const n = ((count % array.length) + array.length) % array.length;
  return array.slice(n).concat(array.slice(0, n));
}

export function rotateRight(array, count = 1) {
  const n = ((count % array.length) + array.length) % array.length;
  return array.slice(array.length - n).concat(array.slice(0, array.length - n));
}

