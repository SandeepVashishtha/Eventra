/**
 * adds a detect-rect helper.
 */
export function detectRect(value) {
  return String(value).split('').sort().join('');
}

