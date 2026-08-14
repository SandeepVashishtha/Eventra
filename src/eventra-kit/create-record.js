/**
 * adds a create-record helper.
 */
export function createRecord(value) {
  return Array.isArray(value) ? Object.fromEntries(value) : {};
}

