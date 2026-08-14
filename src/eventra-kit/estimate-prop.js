/**
 * adds a estimate-prop helper.
 */
export function estimateProp(value) {
  return value == null ? 0 : Object.keys(value).length;
}

