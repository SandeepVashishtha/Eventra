/**
 * adds a create-delta helper.
 */
export function createDelta(value) {
  return value == null || String(value).trim() === '';
}

