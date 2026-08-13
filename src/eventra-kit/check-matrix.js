/**
 * adds a check-matrix helper.
 */
export function checkMatrix(value) {
  return value.map((item, index) => ({ item, index }));
}

