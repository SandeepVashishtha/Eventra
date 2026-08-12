/**
 * adds a assert-list helper.
 */
export function assertList(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

