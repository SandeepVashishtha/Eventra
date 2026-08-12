
/**
 * adds a vowel counter.
 */
export function countVowels(text) {
  return (String(text).match(/[aeiouAEIOU]/g) || []).length;
}

export function countConsonants(text) {
  return (String(text).match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]/g) || []).length;
}

