
/**
 * adds a duration parser.
 */
export function parseDuration(text) {
  const match = String(text).match(/^(\d+)\s*(s|m|h|d)?$/i);
  if (!match) return 0;
  const value = Number(match[1]);
  const unit = (match[2] || 's').toLowerCase();
  return value * (unit === 'd' ? 86400 : unit === 'h' ? 3600 : unit === 'm' ? 60 : 1);
}

