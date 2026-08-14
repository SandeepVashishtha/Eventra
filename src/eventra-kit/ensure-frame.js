/**
 * adds a ensure-frame helper.
 */
export function ensureFrame(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

