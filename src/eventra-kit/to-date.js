
/**
 * adds a date parser.
 */
export function toDate(value) {
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

