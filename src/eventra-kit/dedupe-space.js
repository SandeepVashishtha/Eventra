/**
 * adds a dedupe-space helper.
 */
export function dedupeSpace(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

