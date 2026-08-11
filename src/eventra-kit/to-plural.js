
/**
 * adds a plural helper.
 */
export function toPlural(word, count) {
  return count === 1 ? word : `${word}s`;
}

