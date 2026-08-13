
/**
 * adds a code indenter.
 */
export function indentCode(code, spaces = 4) {
  return String(code)
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : ' '.repeat(spaces) + line))
    .join('\n');
}

