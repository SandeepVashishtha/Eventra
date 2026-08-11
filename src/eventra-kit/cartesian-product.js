
/**
 * adds a cartesian product helper.
 */
export function cartesianProduct(arrays) {
  return arrays.reduce((acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])), [[]]);
}

