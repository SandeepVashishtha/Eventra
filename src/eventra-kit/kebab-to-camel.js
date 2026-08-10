
/**
 * adds a kebab-to-camel converter.
 */
export function kebabToCamel(str) {
  return String(str).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

