/**
 * adds a diff-file helper.
 */
export function diffFile(value) {
  return value.split(' ').filter(Boolean).length;
}

