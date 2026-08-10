
/**
 * adds an adjacency checker.
 */
export function hasAdjacentEqual(array) {
  for (let i = 1; i < array.length; i++) {
    if (array[i] === array[i - 1]) return true;
  }
  return false;
}

