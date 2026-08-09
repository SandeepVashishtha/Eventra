
/**
 * adds a key picker.
 */
export function pickKeys(obj, keys) {
  const out = {};
  for (const key of keys) {
    if (key in obj) out[key] = obj[key];
  }
  return out;
}

