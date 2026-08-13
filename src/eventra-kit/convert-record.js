/**
 * adds a convert-record helper.
 */
export function convertRecord(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

