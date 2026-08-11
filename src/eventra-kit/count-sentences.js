
/**
 * adds a sentence counter.
 */
export function countSentences(text) {
  return (String(text).match(/[.!?]+(\s|$)/g) || []).length;
}

