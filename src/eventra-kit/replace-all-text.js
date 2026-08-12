
/**
 * adds an all replacement helper.
 */
export function replaceAllText(text, search, replacement) {
  return String(text).split(search).join(replacement);
}

