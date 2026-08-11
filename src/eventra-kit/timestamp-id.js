
/**
 * adds a timestamp id helper.
 */
export function timestampId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

