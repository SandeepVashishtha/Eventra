/**
 * adds a detect-range helper.
 */
export function detectRange(value) {
  return value == null || String(value).trim() === '';
}

