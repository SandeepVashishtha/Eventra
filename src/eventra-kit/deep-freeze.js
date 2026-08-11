
/**
 * adds a deep freeze helper.
 */
export function deepFreeze(obj) {
  for (const key of Object.getOwnPropertyNames(obj)) {
    const value = obj[key];
    if (value && typeof value === 'object') deepFreeze(value);
  }
  return Object.freeze(obj);
}

