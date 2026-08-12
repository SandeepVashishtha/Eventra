
/**
 * adds an array halving helper.
 */
export function splitArrayInHalf(array) {
  const mid = Math.ceil(array.length / 2);
  return [array.slice(0, mid), array.slice(mid)];
}

