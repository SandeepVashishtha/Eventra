/**
 * adds a deduplicate-step helper.
 */
export function deduplicateStep(value) {
  return String(value).trim().split(/\s+/);
}

