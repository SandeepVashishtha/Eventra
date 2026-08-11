
/**
 * adds a type helper.
 */
export function getObjectType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

