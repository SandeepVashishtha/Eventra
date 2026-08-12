
/**
 * adds a text centerer.
 */
export function centerText(text, width, fill = ' ') {
  const pad = Math.max(0, width - text.length);
  const left = Math.floor(pad / 2);
  const right = pad - left;
  return fill.repeat(left) + text + fill.repeat(right);
}

