/**
 * adds a ensure-triple helper.
 */
export function ensureTriple(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

