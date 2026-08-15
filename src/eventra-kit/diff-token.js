/**
 * adds a diff-token helper.
 */
export function diffToken(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

