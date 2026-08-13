
/**
 * adds a future date helper.
 */
import { addDaysToDate } from './add-days-to-date.js';

export function futureDate(daysAhead) {
  return addDaysToDate(new Date(), daysAhead);
}

