/**
 * adds a count-array helper.
 */
export function countArray(value) {
  return String(value).split('').sort().join('');
}

