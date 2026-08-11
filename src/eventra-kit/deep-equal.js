
/**
 * adds a deep equality helper.
 */
export function deepEqual(first, second) {
  if (first === second) return true;
  if (typeof first !== 'object' || typeof second !== 'object' || first === null || second === null) return false;
  const aKeys = Object.keys(first);
  const bKeys = Object.keys(second);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => deepEqual(first[key], second[key]));
}

