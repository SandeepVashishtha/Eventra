/**
 * adds a deduplicate-order helper.
 */
export function deduplicateOrder(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

