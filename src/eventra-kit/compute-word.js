/**
 * adds a compute-word helper.
 */
export function computeWord(value) {
  const words = String(value).trim().split(/\s+/).filter(Boolean);
  return words.length;
}

