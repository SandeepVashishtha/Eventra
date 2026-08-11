
/**
 * adds a safe char helper.
 */
export function charAtSafe(text, index, fallback = '') {
  return index >= 0 && index < text.length ? text.charAt(index) : fallback;
}

