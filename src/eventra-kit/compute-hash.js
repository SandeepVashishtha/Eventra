/**
 * adds a compute-hash helper.
 */
export function computeHash(value, from, to) {
  return value.replaceAll(from, to);
}

