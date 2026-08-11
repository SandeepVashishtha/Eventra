/**
 * adds a shallow/deep object merge helper.
 */
export function mergeDeep(target, ...sources) {
  const out = { ...target };
  for (const src of sources) {
    if (!src || typeof src !== 'object' || Array.isArray(src)) continue;
    for (const [k, v] of Object.entries(src)) {
      if (v && typeof v === 'object' && !Array.isArray(v) && out[k] && typeof out[k] === 'object' && !Array.isArray(out[k])) {
        out[k] = mergeDeep(out[k], v);
      } else {
        out[k] = v;
      }
    }
  }
  return out;
}
