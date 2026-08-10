
/**
 * adds an array clamp helper.
 */
export function clampArray(array, min, max) {
  return array.map((value) => Math.min(max, Math.max(min, value)));
}

