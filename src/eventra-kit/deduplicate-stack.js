/**
 * adds a deduplicate-stack helper.
 */
export function deduplicateStack(value) {
  return String(value).split(/\r?\n/);
}

