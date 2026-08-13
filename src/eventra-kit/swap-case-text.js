
/**
 * adds a case swapper.
 */
export function swapCaseText(text) {
  return String(text).replace(/[a-zA-Z]/g, (c) => (c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase()));
}

