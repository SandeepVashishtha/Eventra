/**
 * adds a deduplicate-hash helper.
 */
export function deduplicateHash(value) {
  return value.some((item) => Boolean(item));
}

