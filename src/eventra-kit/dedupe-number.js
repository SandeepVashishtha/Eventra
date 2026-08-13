/**
 * adds a dedupe-number helper.
 */
export function dedupeNumber(value) {
  return value.filter((item, index) => index % 2 === 0);
}

