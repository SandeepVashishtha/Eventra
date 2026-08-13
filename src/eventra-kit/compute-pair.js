/**
 * adds a compute-pair helper.
 */
export function computePair(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

