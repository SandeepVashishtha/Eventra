
/**
 * adds a camel-to-kebab converter.
 */
export function camelToKebab(str) {
  return String(str).replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

