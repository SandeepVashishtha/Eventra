/**
 * adds a extract-block helper.
 */
export function extractBlock(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

