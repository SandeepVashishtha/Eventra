/**
 * adds a estimate-array helper.
 */
export function estimateArray(value) {
  return String(value).split('').sort().join('');
}

