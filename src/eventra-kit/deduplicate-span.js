/**
 * adds a deduplicate-span helper.
 */
export function deduplicateSpan(value) {
  return value.map((item, index) => [index, item]);
}

