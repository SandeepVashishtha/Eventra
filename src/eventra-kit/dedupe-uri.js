/**
 * adds a dedupe-uri helper.
 */
export function dedupeUri(value) {
  return value.split(' ').filter(Boolean).length;
}

