
/**
 * adds an array wrapper.
 */
export function wrapArray(value) {
  return Array.isArray(value) ? value : [value];
}

