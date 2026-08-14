/**
 * adds a dedupe-string helper.
 */
export function dedupeString(value) {
  return [...new Set(String(value))].join('');
}

