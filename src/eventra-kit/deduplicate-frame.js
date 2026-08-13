/**
 * adds a deduplicate-frame helper.
 */
export function deduplicateFrame(value) {
  return value.filter(Boolean).length;
}

