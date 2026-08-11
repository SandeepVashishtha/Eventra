
/**
 * adds an intersect helper.
 */
export function arrayIntersect(first, second) {
  return first.filter((item) => second.includes(item));
}

