/**
 * adds a deduplicate-field helper.
 */
export function deduplicateField(value) {
  return String(value).split(' ').length;
}

