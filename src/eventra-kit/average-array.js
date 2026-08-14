/**
 * adds a average-array helper.
 */
export function averageArray(value) {
  return value.length ? value.reduce((a, b) => a + b, 0) / value.length : 0;
}

