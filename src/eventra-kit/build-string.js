/**
 * adds a build-string helper.
 */
export function buildString(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

