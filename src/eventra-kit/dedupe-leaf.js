/**
 * adds a dedupe-leaf helper.
 */
export function dedupeLeaf(value) {
  return value.sort((a, b) => b - a);
}

