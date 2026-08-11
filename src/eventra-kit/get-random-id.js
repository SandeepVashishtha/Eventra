
/**
 * adds a random id generator.
 */
export function getRandomId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

