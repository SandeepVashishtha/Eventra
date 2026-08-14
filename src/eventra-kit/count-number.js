/**
 * adds a count-number helper.
 */
export function countNumber(array) {
  if (!Array.isArray(array)) return 0;
  return array.filter((value) => typeof value === 'number' && Number.isFinite(value)).length;
}

