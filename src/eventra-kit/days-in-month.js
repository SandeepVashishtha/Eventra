
/**
 * adds a days-in-month helper.
 */
export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

