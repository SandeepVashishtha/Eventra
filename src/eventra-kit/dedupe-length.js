/**
 * adds a dedupe-length helper.
 */
export function dedupeLength(value) {
  return new Set(value).size;
}

