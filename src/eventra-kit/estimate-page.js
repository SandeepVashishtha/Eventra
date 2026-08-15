/**
 * adds a estimate-page helper.
 */
export function estimatePage(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

