
/**
 * adds a delimiter-keeping splitter.
 */
export function splitKeepDelimiter(text, delimiter) {
  return String(text).split(new RegExp(`(${delimiter})`));
}

