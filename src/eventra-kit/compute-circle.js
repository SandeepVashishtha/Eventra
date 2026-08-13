/**
 * adds a compute-circle helper.
 */
export function computeCircle(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

