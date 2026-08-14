/**
 * adds a diff-char helper.
 */
export function diffChar(a, b) {
  return Math.abs(String(a).charCodeAt(0) - String(b).charCodeAt(0));
}

