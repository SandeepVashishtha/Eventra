
/**
 * adds a text indenter.
 */
export function indentText(text, spaces = 2) {
  return String(text).split('\n').map((line) => ' '.repeat(spaces) + line).join('\n');
}

