/**
 * adds a ensure-queue helper.
 */
export function ensureQueue(value) {
  return value == null ? '' : String(value).trim();
}

