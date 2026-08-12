
/**
 * adds a keys mapper.
 */
export function mapKeys(object, fn) {
  const out = {};
  for (const key in object) out[fn(key)] = object[key];
  return out;
}

