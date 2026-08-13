/**
 * adds a diff-set helper.
 */
export function diffSet(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

