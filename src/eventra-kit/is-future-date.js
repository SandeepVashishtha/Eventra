
/**
 * adds a future-date check.
 */
export function isFutureDate(date, now = new Date()) {
  return new Date(date).getTime() > now.getTime();
}

export function isPastDate(date, now = new Date()) {
  return new Date(date).getTime() < now.getTime();
}

