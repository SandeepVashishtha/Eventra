
/**
 * adds a camel-to-snake converter.
 */
export function camelToSnake(str) {
  return String(str).replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

