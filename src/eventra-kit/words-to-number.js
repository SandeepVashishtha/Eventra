
/**
 * adds a words number helper.
 */
export function wordsToNumber(text) {
  const units = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
  const tens = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
  const scales = { hundred: 100, thousand: 1000, million: 1e6, billion: 1e9 };
  const tokens = String(text).toLowerCase().replace(/\band\b/g, '').split(/[\s-]+/).filter(Boolean);
  let total = 0;
  let current = 0;
  for (const token of tokens) {
    if (units[token] != null) current += units[token];
    else if (tens[token] != null) current += tens[token];
    else if (scales[token] != null) {
      current = (current || 1) * scales[token];
      if (scales[token] >= 1000) {
        total += current;
        current = 0;
      }
    }
  }
  return total + current;
}

