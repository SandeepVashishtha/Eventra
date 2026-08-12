
/**
 * adds array membership helpers.
 */
export function containsAll(array, values) {
  return values.every(v => array.includes(v));
}

export function containsAny(array, values) {
  return values.some(v => array.includes(v));
}

export function intersection(a, b) {
  const set = new Set(b);
  return a.filter(v => set.has(v));
}

