
/**
 * adds a time string helper.
 */
export function timeOfDayString(date) {
  return date.toTimeString().slice(0, 8);
}

