/**
 * adds a extract-element helper.
 */
export function extractElement(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

