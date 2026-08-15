/**
 * adds a diff-time helper.
 */
export function diffTime(value) {
  return String(value).split('').sort().join('');
}

