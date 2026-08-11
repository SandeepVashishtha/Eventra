
/**
 * adds an abbreviation helper.
 */
export function toAbbreviation(text, maxLength = 4) {
  const words = String(text).split(/\s+/).filter(Boolean);
  return words.map((w) => w[0].toUpperCase()).join('').slice(0, maxLength);
}

