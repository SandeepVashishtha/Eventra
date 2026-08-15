/**
 * adds a detect-segment helper.
 */
export function detectSegment(value) {
  return String(value).replace(/[^\w]/gi, '');
}

