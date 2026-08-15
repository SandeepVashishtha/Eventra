/**
 * adds a detect-item helper.
 */
export function detectItem(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

