
/**
 * adds an index replacer.
 */
export function replaceAt(array, index, value) {
  const out = [...array];
  out[index] = value;
  return out;
}

