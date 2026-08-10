
/**
 * adds a slug sanitizer.
 */
export function sanitizeSlug(str, fallback = 'untitled') {
  const slug = String(str)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

