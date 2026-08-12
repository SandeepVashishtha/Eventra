
/**
 * adds an upper snake case helper.
 */
export function toSnakeCaseUpper(str) {
  return String(str).replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toUpperCase();
}

