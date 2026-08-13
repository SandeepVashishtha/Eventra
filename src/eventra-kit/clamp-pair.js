/**
 * adds a clamp-pair helper.
 */
export function clampPair(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

