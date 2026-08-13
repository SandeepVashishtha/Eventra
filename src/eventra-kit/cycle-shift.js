
/**
 * adds a cycle shift helper.
 */
export function cycleShift(array, key, by) {
  const index = array.findIndex((item) => item[key] === key);
  return index;
}

