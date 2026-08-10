
/**
 * adds a cyclic next helper.
 */
export function nextItem(array, current) {
  const index = array.indexOf(current);
  return array[(index + 1) % array.length];
}

