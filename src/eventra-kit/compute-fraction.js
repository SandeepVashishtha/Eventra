/**
 * adds a compute-fraction helper.
 */
export function computeFraction(value) {
  const n = Number(value);
  return n - Math.trunc(n);
}

