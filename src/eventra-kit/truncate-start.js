
/**
 * adds a start truncator.
 */
export function truncateStart(text, maxLength, prefix = '...') {
  const str = String(text);
  if (str.length <= maxLength) return str;
  if (maxLength <= 0) return '';
  if (maxLength <= prefix.length) return prefix.slice(0, maxLength);
  return prefix + str.slice(-(maxLength - prefix.length));
}

