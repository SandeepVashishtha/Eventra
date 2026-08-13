
/**
 * adds a subtract helper.
 */
export function arraySubtract(first, second) {
  return first.filter((item) => !second.includes(item));
}

