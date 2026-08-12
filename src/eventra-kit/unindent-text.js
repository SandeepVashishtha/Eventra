
/**
 * adds a text unindenter.
 */
export function unindentText(text, spaces = 4) {
  return String(text)
    .split('\n')
    .map((line) => (line.startsWith(' '.repeat(spaces)) ? line.slice(spaces) : line))
    .join('\n');
}

