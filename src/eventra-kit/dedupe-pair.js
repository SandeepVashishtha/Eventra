/**
 * adds a dedupe-pair helper.
 */
export function dedupePair(value) {
  return String(value).split(/\r?\n/);
}

