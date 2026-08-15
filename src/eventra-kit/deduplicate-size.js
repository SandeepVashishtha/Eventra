/**
 * adds a deduplicate-size helper.
 */
export function deduplicateSize(value) {
  return value.filter((item, index) => index % 2 === 0);
}

