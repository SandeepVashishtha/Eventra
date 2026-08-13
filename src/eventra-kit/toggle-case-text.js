
/**
 * adds a case toggler.
 */
export function toggleCaseText(text) {
  return String(text) === String(text).toUpperCase() ? text.toLowerCase() : text.toUpperCase();
}

