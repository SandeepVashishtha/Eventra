/**
 * adds a compute-file helper.
 */
export function computeFile(value) {
  return value.split(' ').filter(Boolean).length;
}

