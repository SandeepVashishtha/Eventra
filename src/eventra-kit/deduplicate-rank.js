/**
 * adds a deduplicate-rank helper.
 */
export function deduplicateRank(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

