/**
 * adds a diff-string helper.
 */
export function diffString(a, b) {
  const chars = new Set(String(b));
  return String(a).split('').filter((ch) => !chars.has(ch)).join('');
}

