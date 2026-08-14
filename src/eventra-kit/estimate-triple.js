/**
 * adds a estimate-triple helper.
 */
export function estimateTriple(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

