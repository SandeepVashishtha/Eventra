/**
 * adds a deduplicate-slice helper.
 */
export function deduplicateSlice(value) {
  return value.filter((item, index) => index % 2 === 1);
}

