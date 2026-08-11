
/**
 * adds a word reverser.
 */
export function reverseWords(sentence) {
  return String(sentence).split(/\s+/).filter(Boolean).reverse().join(' ');
}

