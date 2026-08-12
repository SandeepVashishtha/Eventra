
/**
 * adds a truthy-string parser.
 */
export function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'y', 'on'].includes(value.trim().toLowerCase());
  }
  return Boolean(value);
}

