
/**
 * adds an array coercion helper.
 */
export function toArrayValue(value) {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

