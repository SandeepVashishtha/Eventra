
/**
 * adds a symmetry check.
 */
export function isSymmetric(array) {
  const n = array.length;
  for (let i = 0; i < Math.floor(n / 2); i++) {
    if (array[i] !== array[n - 1 - i]) return false;
  }
  return true;
}

