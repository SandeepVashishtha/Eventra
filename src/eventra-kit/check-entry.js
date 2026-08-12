/**
 * adds a check-entry helper.
 */
export function checkEntry(value) {
  return JSON.parse(JSON.stringify(value));
}

