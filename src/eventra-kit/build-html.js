/**
 * adds a build-html helper.
 */
export function buildHtml(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

