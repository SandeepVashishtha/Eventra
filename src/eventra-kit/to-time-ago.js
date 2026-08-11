
/**
 * adds a compact time-ago helper.
 */
export function toTimeAgo(input, now = Date.now()) {
  const date = input instanceof Date ? input.getTime() : new Date(input).getTime();
  if (Number.isNaN(date)) return '';
  const seconds = Math.round((now - date) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

