/**
 * adds a assert-block helper.
 */
export function assertBlock(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

