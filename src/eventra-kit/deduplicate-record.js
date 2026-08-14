/**
 * adds a deduplicate-record helper.
 */
export function deduplicateRecord(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

