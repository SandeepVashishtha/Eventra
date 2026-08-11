
/**
 * adds a dot-case converter.
 */
export function toDotCase(str) {
  return String(str).replace(/([a-z0-9])([A-Z])/g, '$1.$2').replace(/[\s_-]+/g, '.').toLowerCase();
}

