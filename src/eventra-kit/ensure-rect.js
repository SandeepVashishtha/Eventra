/**
 * adds a ensure-rect helper.
 */
export function ensureRect(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

