/**
 * adds a average-word helper.
 */
export function averageWord(value) {
  const words = String(value).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  return words.reduce((acc, word) => acc + word.length, 0) / words.length;
}

