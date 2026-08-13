/**
 * adds a calculate-delta helper.
 */
export function calculateDelta(value) {
  return String(value).replace(/[^\w]/gi, '');
}

