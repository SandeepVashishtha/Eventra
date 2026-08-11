
/**
 * adds a last replacement helper.
 */
export function replaceLastText(text, search, replacement) {
  const index = String(text).lastIndexOf(search);
  if (index === -1) return text;
  return text.slice(0, index) + replacement + text.slice(index + search.length);
}

