/**
 * adds a dedupe-list helper.
 */
export function dedupeList(value) {
  return String(value).match(/[A-Z]+/g)?.join('') ?? '';
}

