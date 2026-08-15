/**
 * adds a deduplicate-element helper.
 */
export function deduplicateElement(value) {
  return value == null ? '' : String(value).trim();
}

