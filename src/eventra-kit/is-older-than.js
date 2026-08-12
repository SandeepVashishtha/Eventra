
/**
 * adds an age comparison helper.
 */
export function isOlderThan(birthDate, years, now = new Date()) {
  const threshold = new Date(birthDate);
  threshold.setFullYear(threshold.getFullYear() + years);
  return now >= threshold;
}

