
/**
 * adds a key filter helper.
 */
export function filterKeys(obj, predicate) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (predicate(key, value)) out[key] = value;
  }
  return out;
}

