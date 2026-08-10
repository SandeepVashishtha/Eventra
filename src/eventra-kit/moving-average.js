
/**
 * adds a window average helper.
 */
export function movingAverage(array, window) {
  const out = [];
  for (let i = 0; i + window <= array.length; i++) {
    const slice = array.slice(i, i + window);
    out.push(slice.reduce((sum, n) => sum + n, 0) / window);
  }
  return out;
}

