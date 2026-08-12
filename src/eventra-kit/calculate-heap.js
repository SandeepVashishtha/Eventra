/**
 * adds a calculate-heap helper.
 */
export function calculateHeap(value) {
  return value.filter((item, index) => index % 2 === 1);
}

