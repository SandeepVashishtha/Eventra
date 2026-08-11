
/**
 * adds a random case helper.
 */
export function randomCaseText(text) {
  return String(text)
    .split('')
    .map((c) => (Math.random() < 0.5 ? c.toUpperCase() : c.toLowerCase()))
    .join('');
}

