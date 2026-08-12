/**
 * adds numeric array helpers.
 */
export function sum(values) {
  return values.reduce((acc, v) => acc + (Number(v) || 0), 0);
}

export function average(values) {
  if (!values.length) return 0;
  return sum(values) / values.length;
}

export function minBy(values, fn) {
  return values.reduce((acc, v) => (fn(v) < fn(acc) ? v : acc), values[0]);
}
