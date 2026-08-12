
/**
 * adds a start truncator.
 */
export function truncateStart(text, maxLength, prefix = '...') {
  if (text.length <= maxLength) return text;
  return prefix + text.slice(text.length - maxLength + prefix.length);
}

