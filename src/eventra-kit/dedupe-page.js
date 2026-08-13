/**
 * adds a dedupe-page helper.
 */
export function dedupePage(value) {
  return value.map((item, index) => [index, item]);
}

