
/**
 * adds a top-n numbers helper.
 */
export function maxN(array, n) {
  return [...array].sort((a, b) => b - a).slice(0, n);
}

export function minN(array, n) {
  return [...array].sort((a, b) => a - b).slice(0, n);
}

