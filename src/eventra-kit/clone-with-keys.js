
/**
 * adds a keyed clone helper.
 */
export function cloneWithKeys(obj, keys) {
  const out = {};
  for (const key of keys) {
    if (key in obj) out[key] = obj[key];
  }
  return out;
}

