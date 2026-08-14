
/**
 * adds a word truncator.
 */
export function truncateWords(text, limit = 20) {
  const words = String(text).split(/\s+/);
  if (words.length <= limit) return text;
  return `${words.slice(0, limit).join(' ')}...`;
}

