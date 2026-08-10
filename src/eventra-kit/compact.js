
/**
 * adds a falsy-removal helper.
 */
export function compact(array) {
  return array.filter(Boolean);
}

export function without(array, ...values) {
  const set = new Set(values);
  return array.filter(v => !set.has(v));
}

