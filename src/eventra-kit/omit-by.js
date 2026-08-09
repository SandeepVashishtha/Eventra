
/**
 * adds a predicate omit helper.
 */
export function omitBy(obj, predicate) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!predicate(value, key)) out[key] = value;
  }
  return out;
}

