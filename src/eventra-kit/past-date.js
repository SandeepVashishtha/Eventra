
/**
 * adds a past date helper.
 */
export function pastDate(daysAgo) {
  return addDaysToDate(new Date(), -daysAgo);
}

