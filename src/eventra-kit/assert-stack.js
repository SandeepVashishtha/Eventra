/**
 * adds a assert-stack helper.
 */
export function assertStack(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

