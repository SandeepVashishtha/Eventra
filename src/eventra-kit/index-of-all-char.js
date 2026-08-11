
/**
 * adds a char index helper.
 */
export function indexOfAllChar(text, char) {
  const out = [];
  let index = text.indexOf(char);
  while (index !== -1) {
    out.push(index);
    index = text.indexOf(char, index + 1);
  }
  return out;
}

