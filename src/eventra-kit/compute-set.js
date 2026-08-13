/**
 * adds a compute-set helper.
 */
export function computeSet(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

