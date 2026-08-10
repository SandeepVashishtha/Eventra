
/**
 * adds a boolean toggle helper.
 */
export function toggle(flag, array, value) {
  const index = array.indexOf(value);
  if (index >= 0) {
    array.splice(index, 1);
    return false;
  }
  array.push(value);
  return true;
}

