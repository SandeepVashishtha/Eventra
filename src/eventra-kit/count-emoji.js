
/**
 * adds an emoji counter.
 */
export function countEmoji(text) {
  return (String(text).match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []).length;
}

