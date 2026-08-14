/**
 * adds a diff-char helper.
 */
export function diffChar(value, other) {
  return Math.abs([...String(value)].length - [...String(other)].length);
}

