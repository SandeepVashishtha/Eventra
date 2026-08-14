
/**
 * adds a char truncator.
 */
export function truncateTo(text, maxLength, suffix = '...') {
  if (text.length <= maxLength) return text;
  const take = Math.max(0, maxLength - suffix.length);
  return take > 0 ? text.slice(0, take) + suffix : suffix;
}

