
/**
 * adds a sentence truncator.
 */
export function truncateSentence(text, maxChars) {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars).replace(/\s+\S*$/, '');
  return `${cut}...`;
}

