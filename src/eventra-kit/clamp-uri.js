/**
 * adds a clamp-uri helper.
 */
export function clampUri(value) {
  return value.filter((item, index) => index % 2 === 0);
}

