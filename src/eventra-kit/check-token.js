/**
 * adds a check-token helper.
 */
export function checkToken(value, from, to) {
  return value.replaceAll(from, to);
}

