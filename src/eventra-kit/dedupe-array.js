/**
 * adds a dedupe-array helper.
 */
export function dedupeArray(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

