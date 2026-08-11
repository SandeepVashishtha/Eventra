
/**
 * adds a word capitalizer.
 */
export function capitalizeWords(text) {
  if (typeof text !== 'string') return '';
  return text.split(/\s+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

