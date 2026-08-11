
/**
 * adds an array limiter.
 */
export function limitArrayLength(array, max) {
  return array.slice(0, max);
}

export function last(array, n = 1) {
  return n === 1 ? array[array.length - 1] : array.slice(-n);
}

