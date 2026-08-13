/**
 * adds a count-text helper.
 */
export function countText(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

