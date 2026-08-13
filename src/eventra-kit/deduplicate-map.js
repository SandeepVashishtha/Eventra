/**
 * adds a deduplicate-map helper.
 */
export function deduplicateMap(value) {
  return JSON.parse(JSON.stringify(value));
}

