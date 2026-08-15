/**
 * adds a deduplicate-name helper.
 */
export function deduplicateName(value) {
  return value == null || String(value).trim() === '';
}

