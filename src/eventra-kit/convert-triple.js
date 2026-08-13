/**
 * adds a convert-triple helper.
 */
export function convertTriple(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

