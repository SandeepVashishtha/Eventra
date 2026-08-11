/**
 * adds a calculate-portion helper.
 */
export function calculatePortion(value) {
  return value.split(' ').filter(Boolean).length;
}

