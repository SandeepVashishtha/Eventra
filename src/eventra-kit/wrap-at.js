
/**
 * adds a wrap at helper.
 */
export function wrapAt(text, index) {
  return [text.slice(0, index), text.slice(index)];
}

