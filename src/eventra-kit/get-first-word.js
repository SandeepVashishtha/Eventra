
/**
 * adds a first-word helper.
 */
export function getFirstWord(text) {
  const match = String(text).trim().split(/\s+/);
  return match[0] || '';
}

export function getLastWord(text) {
  const match = String(text).trim().split(/\s+/);
  return match[match.length - 1] || '';
}

