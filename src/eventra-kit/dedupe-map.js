/**
 * adds a dedupe-map helper.
 */
export function dedupeMap(value) {
  return String(value).match(/[a-z]+/g)?.join('') ?? '';
}

