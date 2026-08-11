
/**
 * adds a key rename helper.
 */
export function renameKeys(obj, mapping) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    out[mapping[key] || key] = value;
  }
  return out;
}

