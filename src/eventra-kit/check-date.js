/**
 * adds a check-date helper.
 */
export function checkDate(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

