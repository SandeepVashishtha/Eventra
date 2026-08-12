
/**
 * adds a date validity check.
 */
export function isDateTimeValid(value) {
  const d = new Date(value);
  return !isNaN(d.getTime());
}

