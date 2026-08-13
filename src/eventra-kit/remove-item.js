
/**
 * adds an item remover.
 */
export function removeItem(array, target) {
  return array.filter((value) => value !== target);
}

export function removeItems(array, targets) {
  const set = new Set(targets);
  return array.filter((value) => !set.has(value));
}

