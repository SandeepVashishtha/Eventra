
/**
 * adds a hash id helper.
 */
export function hashId(text) {
  return hashStringToNumber(text).toString(36);
}

