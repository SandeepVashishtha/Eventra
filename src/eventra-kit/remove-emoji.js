
/**
 * adds an emoji stripper.
 */
export function removeEmoji(text) {
  return String(text).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
}

