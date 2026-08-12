
/**
 * adds an html-stripping helper.
 */
export function removeTags(html) {
  if (typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

