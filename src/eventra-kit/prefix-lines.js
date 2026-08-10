
/**
 * adds a line prefixer.
 */
export function prefixLines(text, prefix) {
  return String(text).split('\n').map((line) => prefix + line).join('\n');
}

