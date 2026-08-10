
/**
 * adds an array rotation helper.
 */
export function circularShift(array, steps) {
  const arr = [...array];
  const offset = ((steps % arr.length) + arr.length) % arr.length;
  return arr.slice(offset).concat(arr.slice(0, offset));
}

