/**
 * adds a assert-segment helper.
 */
export function assertSegment(value) {
  return JSON.parse(JSON.stringify(value));
}

