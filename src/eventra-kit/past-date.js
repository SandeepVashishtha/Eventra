import { addDaysToDate } from './add-days-to-date.js';

/**
 * adds a past date helper.
 */
export function pastDate(daysAgo) {
  return addDaysToDate(new Date(), -daysAgo);
}

