/**
 * adds a extract-field helper.
 */
export function extractField(value) {
  return String(value).split(':')[0];
}

