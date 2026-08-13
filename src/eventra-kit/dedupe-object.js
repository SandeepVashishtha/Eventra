/**
 * adds a dedupe-object helper.
 */
export function dedupeObject(value) {
  return value.filter((item, index) => index % 2 === 1);
}

