
/**
 * adds a human list formatter.
 */
export function formatList(items, { conjunction = 'and', max = Infinity, overflow = 'and N more' } = {}) {
  const list = [...items];
  if (list.length <= max) {
    if (list.length === 0) return '';
    if (list.length === 1) return String(list[0]);
    const head = list.slice(0, -1).join(', ');
    return `${head} ${conjunction} ${list[list.length - 1]}`;
  }
  const shown = list.slice(0, max).join(', ');
  const rest = list.length - max;
  return `${shown} ${overflow.replace('N', rest)}`;
}

