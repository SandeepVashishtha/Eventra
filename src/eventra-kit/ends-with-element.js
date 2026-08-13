
/**
 * adds a last-element check.
 */
export function endsWithElement(array, value) {
  return array[array.length - 1] === value;
}

export function startsWithElement(array, value) {
  return array[0] === value;
}

