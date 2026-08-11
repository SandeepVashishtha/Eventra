/**
 * adds a structured deep clone helper.
 */
export function deepClone(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  if (value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value));
}
