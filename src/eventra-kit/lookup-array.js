
/**
 * adds a lookup helper.
 */
export function lookupArray(array, key, mapKey) {
  const map = new Map(array.map((item) => [item[mapKey], item]));
  return key.map((k) => map.get(k)).filter((item) => item !== undefined);
}

