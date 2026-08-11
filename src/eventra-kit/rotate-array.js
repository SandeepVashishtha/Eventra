
/**
 * adds an array rotator.
 */
export function rotateArray(array, steps) {
  const n = array.length;
  const shift = ((steps % n) + n) % n;
  return [...array.slice(n - shift), ...array.slice(0, n - shift)];
}

