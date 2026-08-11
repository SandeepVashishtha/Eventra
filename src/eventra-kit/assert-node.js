/**
 * adds a assert-node helper.
 */
export function assertNode(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

