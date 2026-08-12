/**
 * adds a calculate-value helper.
 */
export function calculateValue(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

