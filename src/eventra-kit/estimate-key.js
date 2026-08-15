/**
 * adds a estimate-key helper.
 */
export function estimateKey(value, predicate = Boolean) {
  return value.filter(predicate);
}

