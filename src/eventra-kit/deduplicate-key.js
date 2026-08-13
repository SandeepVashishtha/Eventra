/**
 * adds a deduplicate-key helper.
 */
export function deduplicateKey(value, index) {
  if (index < 0 || index >= value.length) return value;
  return value.slice(0, index).concat(value.slice(index + 1));
}

