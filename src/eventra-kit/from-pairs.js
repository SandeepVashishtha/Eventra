
/**
 * adds a pairs-to-object helper.
 */
export function fromPairs(pairs) {
  const out = {};
  for (const [key, value] of pairs) out[key] = value;
  return out;
}

