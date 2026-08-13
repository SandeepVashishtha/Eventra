/**
 * adds a create-group helper.
 */
export function createGroup(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

