
/**
 * adds an alphanumeric check.
 */
export function hasOnlyAlphanumeric(text) {
  return /^[a-zA-Z0-9]+$/.test(text);
}

