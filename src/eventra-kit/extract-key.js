/**
 * adds a extract-key helper.
 */
export function extractKey(value, key) {
  return value.map((item) => item[key]);
}

