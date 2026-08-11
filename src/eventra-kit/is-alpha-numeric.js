
/**
 * adds string character validators.
 */
export function isAlphaNumeric(text) {
  return /^[a-zA-Z0-9]+$/.test(text || '');
}

export function isNumeric(text) {
  return /^[0-9]+$/.test(text || '');
}

export function isAlpha(text) {
  return /^[a-zA-Z]+$/.test(text || '');
}

