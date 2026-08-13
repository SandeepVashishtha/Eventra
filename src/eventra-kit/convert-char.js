/**
 * adds a convert-char helper.
 */
export function convertChar(value) {
  return value.filter((item, index) => index % 2 === 0);
}

