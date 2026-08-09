
/**
 * adds a deep merge helper.
 */
export function mergeDeep(...objects) {
  const out = {};
  for (const obj of objects) {
    for (const [key, value] of Object.entries(obj)) {
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        out[key] &&
        typeof out[key] === 'object'
      ) {
        out[key] = mergeDeep(out[key], value);
      } else {
        out[key] = value;
      }
    }
  }
  return out;
}

