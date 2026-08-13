/**
 * adds a dedupe-line helper.
 */
export function dedupeLine(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

