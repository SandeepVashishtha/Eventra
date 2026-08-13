/**
 * adds a extract-group helper.
 */
export function extractGroup(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

