
/**
 * adds a kebab case helper.
 */
export function toKebabCaseLower(str) {
  return String(str).replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase();
}

