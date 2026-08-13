/**
 * adds a build-token helper.
 */
export function buildToken(value) {
  return value.some((item) => Boolean(item));
}

