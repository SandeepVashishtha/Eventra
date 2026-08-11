
/**
 * adds an object falsy remover.
 */
export function compactObject(obj) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value) out[key] = value;
  }
  return out;
}

