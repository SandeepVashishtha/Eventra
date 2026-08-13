/**
 * adds a ensure-char helper.
 */
export function ensureChar(value) {
  return value.filter((item, index) => index % 2 === 0);
}

