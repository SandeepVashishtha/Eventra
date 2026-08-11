
/**
 * adds aggregate finders.
 */
export function findMax(values, fn) {
  if (!values.length) return undefined;
  return values.reduce((acc, v) => (fn(v) > fn(acc) ? v : acc), values[0]);
}

export function findMin(values, fn) {
  if (!values.length) return undefined;
  return values.reduce((acc, v) => (fn(v) < fn(acc) ? v : acc), values[0]);
}

