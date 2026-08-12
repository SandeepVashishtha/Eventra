/**
 * adds a build-entry helper.
 */
export function buildEntry(value) {
  return value.map((item, index) => [index, item]);
}

