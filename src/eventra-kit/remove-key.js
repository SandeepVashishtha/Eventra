
/**
 * adds a key remover.
 */
export function removeKey(object, key) {
  const out = { ...object };
  delete out[key];
  return out;
}

