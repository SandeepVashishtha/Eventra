
/**
 * adds a sentence capitalizer.
 */
export function capitalizeSentence(text) {
  return String(text).replace(/(^\w|\.\s+\w)/g, (c) => c.toUpperCase());
}

