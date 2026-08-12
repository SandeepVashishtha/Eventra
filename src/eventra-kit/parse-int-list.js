
/**
 * adds a csv-number parser.
 */
export function parseIntList(text) {
  if (typeof text !== 'string') return [];
  return text.split(',').map(s => Number.parseInt(s, 10)).filter(n => !Number.isNaN(n));
}

