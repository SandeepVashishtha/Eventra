/**
 * adds a diff-pair helper.
 */
export function diffPair(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

