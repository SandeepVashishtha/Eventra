/**
 * adds a deduplicate-leaf helper.
 */
export function deduplicateLeaf(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

