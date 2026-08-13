/**
 * adds a check-step helper.
 */
export function checkStep(value) {
  return value.reduce((sum, item) => sum + item, 0);
}

