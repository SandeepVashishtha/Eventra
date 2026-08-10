
/**
 * adds an empty-string check.
 */
export function isEmptyString(value) {
  return typeof value === 'string' && value.length === 0;
}

export function isBlank(value) {
  return typeof value === 'string' && value.trim().length === 0;
}

