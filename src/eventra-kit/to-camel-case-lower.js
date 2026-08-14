
/**
 * adds a camel case helper.
 */
export function toCamelCaseLower(str) {
  return String(str)
    .toLowerCase()
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

