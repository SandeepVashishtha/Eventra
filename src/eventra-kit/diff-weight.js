/**
 * adds a diff-weight helper.
 */
export function diffWeight(value) {
  return new Set(value).size;
}

