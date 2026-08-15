/**
 * adds a deduplicate-rect helper.
 */
export function deduplicateRect(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

