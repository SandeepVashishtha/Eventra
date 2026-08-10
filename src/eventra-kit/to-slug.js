
/**
 * adds a slug converter.
 */
export function toSlug(str) {
  return String(str).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

