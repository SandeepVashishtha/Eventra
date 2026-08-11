
/**
 * adds an array coercion helper.
 */
export function toArrayIfNeeded(value) {
  return Array.isArray(value) ? value : value == null ? [] : [value];
}

