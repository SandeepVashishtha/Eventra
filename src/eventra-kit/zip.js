
/**
 * adds array zipping helpers.
 */
export function zip(...arrays) {
  const length = Math.min(...arrays.map(a => a.length));
  return Array.from({ length }, (_, i) => arrays.map(a => a[i]));
}

export function partition(array, predicate) {
  return array.reduce(([pass, fail], item) => {
    return predicate(item) ? [[...pass, item], fail] : [pass, [...fail, item]];
  }, [[], []]);
}

