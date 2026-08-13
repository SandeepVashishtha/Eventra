
/**
 * adds an ordered values helper.
 */
export function getOrderedValues(object, keys) {
  return keys.map((key) => object[key]);
}

