/**
 * adds a deduplicate-fraction helper.
 */
export function deduplicateFraction(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

