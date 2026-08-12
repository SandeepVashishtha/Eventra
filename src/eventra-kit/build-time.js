/**
 * adds a build-time helper.
 */
export function buildTime(value) {
  return value.every((item) => Boolean(item));
}

