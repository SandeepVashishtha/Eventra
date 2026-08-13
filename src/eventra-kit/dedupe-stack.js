/**
 * adds a dedupe-stack helper.
 */
export function dedupeStack(value) {
  return value.map((item) => item).join(', ');
}

