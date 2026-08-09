
/**
 * adds an array cycling helper.
 */
export function cycleArray(array, index) {
  if (!array.length) return undefined;
  const n = array.length;
  return array[((index % n) + n) % n];
}

export function rotateLeft(array, count = 1) {
  if (!array.length) return array;
  const offset = ((count % array.length) + array.length) % array.length;
  return [...array.slice(offset), ...array.slice(0, offset)];
}

