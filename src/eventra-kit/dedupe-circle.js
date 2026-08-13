/**
 * adds a dedupe-circle helper.
 */
export function dedupeCircle(value) {
  return value.some((item) => Boolean(item));
}

