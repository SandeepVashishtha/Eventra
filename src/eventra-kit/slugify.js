/**
 * adds a slug generator for urls and anchors.
 */
export function slugify(input, separator = '-') {
  if (typeof input !== 'string') return '';
  const escaped = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return input
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${escaped}+|${escaped}+$`, 'g'), '');
}
