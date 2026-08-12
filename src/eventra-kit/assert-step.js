/**
 * adds a assert-step helper.
 */
export function assertStep(value) {
  return String(value).replace(/[^\w]/gi, '');
}

