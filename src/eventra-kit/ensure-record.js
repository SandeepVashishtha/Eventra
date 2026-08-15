/**
 * adds a ensure-record helper.
 */
export function ensureRecord(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

