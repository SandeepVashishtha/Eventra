/**
 * adds a create-block helper.
 */
export function createBlock(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

