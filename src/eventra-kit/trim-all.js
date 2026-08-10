
/**
 * adds a deep trim helper.
 */
export function trimAll(value) {
  if (typeof value === 'string') return value.trim();
  if (Array.isArray(value)) return value.map(trimAll);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, v] of Object.entries(value)) out[key] = trimAll(v);
    return out;
  }
  return value;
}

