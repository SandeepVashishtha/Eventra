/**
 * adds a convert-rect helper.
 */
export function convertRect(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

