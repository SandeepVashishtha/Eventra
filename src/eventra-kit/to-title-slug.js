
/**
 * adds a readable slug helper.
 */
export function toTitleSlug(text) {
  if (typeof text !== 'string') return '';
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

