
/**
 * adds a title capitalizer.
 */
export function capitalizeTitle(text) {
  const skip = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'for', 'nor', 'of', 'on', 'in', 'to', 'with']);
  return String(text).replace(/\w[\w'-]*/g, (word, index) =>
    index === 0 || !skip.has(word.toLowerCase()) ? word.charAt(0).toUpperCase() + word.slice(1) : word
  );
}

