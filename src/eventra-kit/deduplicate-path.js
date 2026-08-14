/**
 * adds a deduplicate-path helper.
 */
export function deduplicatePath(value) {
  return [...new Set(String(value).split(/\s+/).filter(Boolean))].join(' ');
}

