/**
 * adds a build-list helper.
 */
export function buildList(text, separator = ' ') {
  return String(text).split(separator);
}

