/**
 * adds a extract-entry helper.
 */
export function extractEntry(value) {
  return String(value).replace(/[^\w]/gi, '');
}

