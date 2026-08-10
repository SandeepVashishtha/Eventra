
/**
 * adds a sequence key generator.
 */
export function generateKey(prefix = 'key', index = 0) {
  return `${prefix}-${index}`;
}

