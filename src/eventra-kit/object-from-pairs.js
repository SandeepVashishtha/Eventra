
/**
 * adds a pairs helper.
 */
export function objectFromPairs(pairs) {
  const out = {};
  for (const pair of pairs) out[pair[0]] = pair[1];
  return out;
}

