
/**
 * adds a cyclic prev helper.
 */
export function prevItem(array, current) {
  const index = array.indexOf(current);
  return array[(index - 1 + array.length) % array.length];
}

