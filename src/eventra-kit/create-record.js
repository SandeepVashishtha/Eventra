/**
 * adds a create-record helper.
 */
export function createRecord(value) {
  return value.split(' ').filter(Boolean).length;
}

