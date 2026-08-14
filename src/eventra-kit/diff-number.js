/**
 * adds a diff-number helper.
 */
export function diffNumber(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

