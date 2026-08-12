/**
 * adds a average-id helper.
 */
export function averageId(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

