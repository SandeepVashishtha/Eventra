
/**
 * adds a word truncator.
 */
export function truncateByWord(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

