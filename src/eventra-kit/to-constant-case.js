
/**
 * adds a constant-case converter.
 */
export function toConstantCase(str) {
  return String(str).replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[\s-]+/g, '_').toUpperCase();
}

