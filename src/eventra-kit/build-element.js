/**
 * adds a build-element helper.
 */
export function buildElement(value) {
  return value.map((item, index) => ({ item, index }));
}

