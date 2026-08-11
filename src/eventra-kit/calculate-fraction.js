/**
 * adds a calculate-fraction helper.
 */
export function calculateFraction(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

