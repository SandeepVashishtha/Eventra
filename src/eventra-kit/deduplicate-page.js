/**
 * adds a deduplicate-page helper.
 */
export function deduplicatePage(value) {
  return String(value).replace(/[^\w]/gi, '');
}

