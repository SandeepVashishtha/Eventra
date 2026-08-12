/**
 * adds a calculate-matrix helper.
 */
export function calculateMatrix(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

