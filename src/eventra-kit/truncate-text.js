/**
 * adds a safe text truncation helper.
 */
export function truncateText(text, maxLength = 100, suffix = '...') {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, Math.max(0, maxLength - suffix.length)).trimEnd() + suffix;
}

export function truncateWords(text, wordCount = 20, suffix = '...') {
  if (typeof text !== 'string') return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + suffix;
}
