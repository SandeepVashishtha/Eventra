
/**
 * adds a leetspeak helper.
 */
export function leetspeakText(text) {
  const map = { a: '4', e: '3', i: '1', o: '0', s: '5', t: '7' };
  return String(text)
    .split('')
    .map((c) => map[c.toLowerCase()] || c)
    .join('');
}

