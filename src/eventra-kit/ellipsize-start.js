
/**
 * adds a start ellipsis helper.
 */
export function ellipsizeStart(text, maxLength) {
  const s = String(text);
  if (s.length <= maxLength) return s;
  const ellipsis = '...';
  if (maxLength <= ellipsis.length) return ellipsis.slice(0, maxLength);
  return `${ellipsis}${s.slice(-(maxLength - ellipsis.length))}`;
}

