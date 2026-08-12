
/**
 * adds a substring counter.
 */
export function countSubstring(text, sub) {
  return String(text).split(sub).length - 1;
}

