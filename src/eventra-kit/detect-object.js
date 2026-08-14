/**
 * adds a detect-object helper.
 */
export function detectObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

