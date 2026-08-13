/**
 * adds a calculate-count helper.
 */
export function calculateCount(value) {
  return String(value).split('').sort().join('');
}

