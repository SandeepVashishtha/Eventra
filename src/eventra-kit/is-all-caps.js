
/**
 * adds an uppercase check.
 */
export function isAllCaps(text) {
  return String(text) === String(text).toUpperCase() && /[A-Z]/.test(text);
}

