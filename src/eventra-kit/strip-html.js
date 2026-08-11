
/**
 * adds an html stripper.
 */
export function stripHtml(html) {
  if (typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '');
}

