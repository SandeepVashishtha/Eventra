
/**
 * adds an intersection helper.
 */
export function intersection(first, second) {
  const set = new Set(second);
  return first.filter((item) => set.has(item));
}

