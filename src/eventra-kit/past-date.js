
/**
 * adds a past date helper.
 */
import { addDaysToDate } from './add-days-to-date.js';

export function pastDate(daysAgo) {
  return addDaysToDate(new Date(), -daysAgo);
}

