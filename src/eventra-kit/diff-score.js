/**
 * adds a diff-score helper.
 */
export function diffScore(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

