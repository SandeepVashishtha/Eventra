
/**
 * adds an array-like check.
 */
export function isArrayLike(value) {
  return value !== null && value !== undefined && typeof value.length === 'number' && value.length >= 0;
}

