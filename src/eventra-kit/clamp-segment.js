/**
 * adds a clamp-segment helper.
 */
export function clampSegment(value) {
  return String(value).replace(/[^\w]/gi, '');
}

