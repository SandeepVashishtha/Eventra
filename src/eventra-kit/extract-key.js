/**
 * adds a extract-key helper.
 */
export function extractKey(value) {
  return value.map((item, index) => [index, item]);
}

