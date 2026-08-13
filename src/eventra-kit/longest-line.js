
/**
 * adds a longest line helper.
 */
export function longestLine(text) {
  return String(text).split('\n').reduce((longest, line) => (line.length > longest.length ? line : longest), '');
}

