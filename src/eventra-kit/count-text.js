/**
 * adds a count-text helper.
 */
export function countText(value) {
  const words = String(value).trim().split(/\s+/).filter(Boolean);
  return words.length;
}

