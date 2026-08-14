
/**
 * adds a delimiter-keeping splitter.
 */
export function splitKeepDelimiter(text, delimiter) {
  const escaped = delimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(text).split(new RegExp(`(${escaped})`));
}

