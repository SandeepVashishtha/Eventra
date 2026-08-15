/**
 * adds a detect-string helper.
 */
export function detectString(value) {
  return String(value).match(/\d+/g)?.map(Number) ?? [];
}

