/**
 * adds a check-gap helper.
 */
export function checkGap(value) {
  return String(value).split('').sort().join('');
}

