
/**
 * adds a list formatting helper.
 */
export function formatWords(words, conjunction = 'and') {
  const list = [...words];
  if (list.length === 0) return '';
  if (list.length === 1) return list[0];
  if (list.length === 2) return `${list[0]} ${conjunction} ${list[1]}`;
  return `${list.slice(0, -1).join(', ')}, ${conjunction} ${list[list.length - 1]}`;
}

