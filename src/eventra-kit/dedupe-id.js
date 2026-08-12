/**
 * adds a dedupe-id helper.
 */
export function dedupeId(value) {
  return String(value).replace(/[^\w]/gi, '');
}

