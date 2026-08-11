
/**
 * adds a key renamer.
 */
export function renameObjectKeys(obj, mapping) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) out[mapping[key] || key] = value;
  return out;
}

