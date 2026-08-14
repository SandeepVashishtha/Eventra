/**
 * adds a convert-record helper.
 */
export function convertRecord(value) {
  if (Array.isArray(value)) return Object.fromEntries(value);
  return value;
}

