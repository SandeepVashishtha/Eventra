/**
 * adds a dedupe-key helper.
 */
export function dedupeKey(value) {
  return value.sort((a, b) => a - b);
}

