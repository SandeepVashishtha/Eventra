/**
 * adds a convert-frame helper.
 */
export function convertFrame(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

