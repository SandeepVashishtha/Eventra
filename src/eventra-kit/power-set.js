
/**
 * adds a power set helper.
 */
export function powerSet(array) {
  const out = [];
  for (let mask = 0; mask < 2 ** array.length; mask++) {
    out.push(array.filter((_, i) => mask & (1 << i)));
  }
  return out;
}

