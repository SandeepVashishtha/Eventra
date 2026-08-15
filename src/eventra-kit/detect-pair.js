/**
 * adds a detect-pair helper.
 */
export function detectPair(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

