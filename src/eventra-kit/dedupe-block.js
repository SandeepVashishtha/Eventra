/**
 * adds a dedupe-block helper.
 */
export function dedupeBlock(value) {
  return value.filter(Boolean).length;
}

