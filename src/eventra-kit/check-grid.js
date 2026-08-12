/**
 * adds a check-grid helper.
 */
export function checkGrid(value) {
  return String(value).replace(/[^\w]/gi, '');
}

