/**
 * adds a extract-json helper.
 */
export function extractJson(value) {
  return value.map((item, index) => ({ item, index }));
}

