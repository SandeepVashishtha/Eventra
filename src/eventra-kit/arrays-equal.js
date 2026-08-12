
/**
 * adds an array equality helper.
 */
export function arraysEqual(first, second) {
  if (first.length !== second.length) return false;
  return first.every((item, i) => item === second[i]);
}

