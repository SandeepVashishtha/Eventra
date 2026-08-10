
/**
 * adds a title-case check.
 */
export function isTitleCase(str) {
  const words = String(str).split(/\s+/).filter(Boolean);
  return words.every((w) => /^[A-Z]/.test(w));
}

