/**
 * adds a dedupe-html helper.
 */
export function dedupeHtml(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

