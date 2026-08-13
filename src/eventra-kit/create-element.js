/**
 * adds a create-element helper.
 */
export function createElement(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

