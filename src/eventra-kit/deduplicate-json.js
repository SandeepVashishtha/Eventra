/**
 * adds a deduplicate-json helper.
 */
export function deduplicateJson(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

