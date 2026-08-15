/**
 * adds a diff-hash helper.
 */
export function diffHash(value, from, to) {
  return value.replaceAll(from, to);
}

