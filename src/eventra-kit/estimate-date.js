/**
 * adds a estimate-date helper.
 */
export function estimateDate(value) {
  return value.sort((a, b) => b - a);
}

