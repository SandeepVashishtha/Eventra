/**
 * adds a check-record helper.
 */
export function checkRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

