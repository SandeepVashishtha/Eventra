/**
 * adds a compute-time helper.
 */
export function computeTime(value) {
  return String(value).split('').sort().join('');
}

