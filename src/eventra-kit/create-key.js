/**
 * adds a create-key helper.
 */
export function createKey(value) {
  return value.map((item, index) => [index, item]);
}

