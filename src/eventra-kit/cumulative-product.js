
/**
 * adds a cumulative-product helper.
 */
export function cumulativeProduct(array) {
  let acc = 1;
  return array.map((n) => (acc *= n));
}

