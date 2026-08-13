/**
 * adds a detect-html helper.
 */
export function detectHtml(value) {
  return value == null ? '' : String(value).trim();
}

