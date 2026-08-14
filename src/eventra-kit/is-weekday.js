
/**
 * adds a weekday check.
 */
import { isWeekend } from './is-weekend.js';

export function isWeekday(date) {
  return !isWeekend(date);
}

