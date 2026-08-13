
/**
 * adds a deep clone helper.
 */
export function deepCloneObject(object) {
  return object === undefined ? undefined : JSON.parse(JSON.stringify(object));
}

