
/**
 * adds a title case helper.
 */
export function titleCaseWords(text) {
  return String(text).replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

