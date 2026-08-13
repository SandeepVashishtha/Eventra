/**
 * adds a create-byte helper.
 */
export function createByte(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

