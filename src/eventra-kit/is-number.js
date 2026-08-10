
/**
 * adds a type-checking helper.
 */
export function isNumber(value) {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isInteger(value) {
  return typeof value === 'number' && Number.isInteger(value);
}

