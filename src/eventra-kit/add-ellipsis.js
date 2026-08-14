
/**
 * adds an ellipsis helper.
 */
export function addEllipsis(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, Math.max(0, maxLength - 3))}...` : text;
}

