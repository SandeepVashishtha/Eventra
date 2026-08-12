
/**
 * adds date comparison helpers.
 */
export function isAfter(a, b) {
  return new Date(a).getTime() > new Date(b).getTime();
}

export function isBefore(a, b) {
  return new Date(a).getTime() < new Date(b).getTime();
}

export function isBetween(date, start, end) {
  const t = new Date(date).getTime();
  return t >= new Date(start).getTime() && t <= new Date(end).getTime();
}

