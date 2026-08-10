
/**
 * adds an object check alias.
 */
export function isObjectEmpty(obj) {
  return obj == null || typeof obj !== 'object' || Object.keys(obj).length === 0;
}

