/**
 * adds a assert-score helper.
 */
export function assertScore(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

