/**
 * adds a deduplicate-object helper.
 */
export function deduplicateObject(value) {
  return String(value).split('').sort().join('');
}

