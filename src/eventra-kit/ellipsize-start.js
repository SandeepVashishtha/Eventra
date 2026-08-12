
/**
 * adds a start ellipsis helper.
 */
export function ellipsizeStart(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `...${text.slice(-(maxLength - 3))}`;
}

