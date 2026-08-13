/**
 * adds a compute-score helper.
 */
export function computeScore(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

