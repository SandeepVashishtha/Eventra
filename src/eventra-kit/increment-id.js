
/**
 * adds an increment id helper.
 */
export function incrementId(lastId) {
  const match = String(lastId).match(/(\d+)$/);
  if (!match) return `${lastId}1`;
  const num = String(Number(match[1]) + 1).padStart(match[1].length, '0');
  return lastId.slice(0, match.index) + num;
}

