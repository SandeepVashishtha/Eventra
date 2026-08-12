/**
 * adds a check-list helper.
 */
export function checkList(value) {
  return value.filter((item, index) => index % 2 === 0);
}

