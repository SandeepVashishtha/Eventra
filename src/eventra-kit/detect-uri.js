/**
 * adds a detect-uri helper.
 */
export function detectUri(value) {
  return value.filter((item, index) => index % 2 === 0);
}

