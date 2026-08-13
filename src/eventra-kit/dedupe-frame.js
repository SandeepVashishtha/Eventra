/**
 * adds a dedupe-frame helper.
 */
export function dedupeFrame(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

