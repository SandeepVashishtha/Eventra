
/**
 * adds an overlap check.
 */
export function containsAny(array, targets) {
  return targets.some((t) => array.includes(t));
}

export function containsAllItems(array, targets) {
  return targets.every((t) => array.includes(t));
}

