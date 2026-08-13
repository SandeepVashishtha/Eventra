
/**
 * adds a shallow equality helper.
 */
export function shallowEqual(first, second) {
  const aKeys = Object.keys(first);
  const bKeys = Object.keys(second);
  if (aKeys.length !== bKeys.length) return false;
  return aKeys.every((key) => first[key] === second[key]);
}

