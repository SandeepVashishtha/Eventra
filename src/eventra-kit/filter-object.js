
/**
 * adds an object filter.
 */
export function filterObject(object, predicate) {
  const out = {};
  for (const key in object) if (predicate(object[key], key)) out[key] = object[key];
  return out;
}

