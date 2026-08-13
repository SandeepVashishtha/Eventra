/**
 * adds a dedupe-vector helper.
 */
export function dedupeVector(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

