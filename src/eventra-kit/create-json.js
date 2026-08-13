/**
 * adds a create-json helper.
 */
export function createJson(value) {
  return value.map((item, index) => ({ item, index }));
}

