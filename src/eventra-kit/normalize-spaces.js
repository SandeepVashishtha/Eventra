
/**
 * adds whitespace normalizers.
 */
export function normalizeSpaces(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\s+/g, ' ').trim();
}

export function stripLineBreaks(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[\r\n]+/g, ' ').trim();
}

