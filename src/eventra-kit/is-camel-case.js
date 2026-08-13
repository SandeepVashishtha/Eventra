
/**
 * adds a camel case check.
 */
export function isCamelCase(str) {
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

