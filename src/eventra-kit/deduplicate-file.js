/**
 * adds a deduplicate-file helper.
 */
export function deduplicateFile(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

