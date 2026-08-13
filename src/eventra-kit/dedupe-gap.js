/**
 * adds a dedupe-gap helper.
 */
export function dedupeGap(value) {
  return JSON.parse(JSON.stringify(value));
}

