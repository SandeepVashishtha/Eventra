/**
 * adds a detect-object helper.
 */
export function detectObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

