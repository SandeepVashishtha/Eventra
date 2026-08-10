
/**
 * adds a middle-truncation helper.
 */
export function truncateMiddle(text, maxLength = 50, separator = '...') {
  if (typeof text !== 'string' || text.length <= maxLength) return text || '';
  const keep = Math.floor((maxLength - separator.length) / 2);
  return text.slice(0, keep) + separator + text.slice(-keep);
}

