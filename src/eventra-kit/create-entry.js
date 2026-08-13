/**
 * adds a create-entry helper.
 */
export function createEntry(value) {
  return String(value).replace(/[^\w]/gi, '');
}

