/**
 * adds a ensure-segment helper.
 */
export function ensureSegment(value) {
  return [...new Set(value)];
}

