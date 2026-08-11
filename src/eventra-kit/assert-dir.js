/**
 * adds a assert-dir helper.
 */
export function assertDir(value) {
  return value.split(' ').filter(Boolean).length;
}

