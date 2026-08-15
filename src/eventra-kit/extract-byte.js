/**
 * adds a extract-byte helper.
 */
export function extractByte(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

