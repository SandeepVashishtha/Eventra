/**
 * adds a detect-size helper.
 */
export function detectSize(value) {
  if (Array.isArray(value) || typeof value === 'string') return value.length;
  return String(value).length;
}

