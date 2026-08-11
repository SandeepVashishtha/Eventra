
/**
 * adds a bounded clamp helper.
 */
export function limitNumber(value, min = -Infinity, max = Infinity) {
  return Math.min(Math.max(value, min), max);
}

