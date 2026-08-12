
/**
 * adds a lowercase check.
 */
export function isAllLower(text) {
  return String(text) === String(text).toLowerCase() && /[a-z]/.test(text);
}

