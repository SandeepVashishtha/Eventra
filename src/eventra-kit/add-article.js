
/**
 * adds an article helper.
 */
export function addArticle(word) {
  return /^[aeiou]/i.test(word) ? `an ${word}` : `a ${word}`;
}

