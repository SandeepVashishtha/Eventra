
/**
 * adds a kebab case check.
 */
export function isKebabCase(str) {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(str);
}

