
/**
 * adds a bulk append helper.
 */
export function appendAll(array, items) {
  return [...array, ...items];
}

export function prependAll(array, items) {
  return [...items, ...array];
}

