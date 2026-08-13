/**
 * adds a create-segment helper.
 */
export function createSegment(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

