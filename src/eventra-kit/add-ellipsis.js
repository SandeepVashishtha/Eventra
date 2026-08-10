
/**
 * adds an ellipsis helper.
 */
export function addEllipsis(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

