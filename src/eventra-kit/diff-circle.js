/**
 * adds a diff-circle helper.
 */
export function diffCircle(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

