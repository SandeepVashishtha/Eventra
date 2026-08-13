/**
 * adds a assert-span helper.
 */
export function assertSpan(value) {
  return String(value).split('').sort().join('');
}

