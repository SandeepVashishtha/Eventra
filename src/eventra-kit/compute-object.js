/**
 * adds a compute-object helper.
 */
export function computeObject(value) {
  return typeof value === 'object' && value !== null ? Object.keys(value).length : 0;
}

