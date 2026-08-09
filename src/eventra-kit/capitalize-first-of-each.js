
/**
 * adds an acronym-style capitalizer.
 */
export function capitalizeFirstOfEach(text, separator = ' ') {
  if (typeof text !== 'string') return '';
  return text.split(separator).filter(Boolean).map(w => w.charAt(0).toUpperCase()).join('');
}

