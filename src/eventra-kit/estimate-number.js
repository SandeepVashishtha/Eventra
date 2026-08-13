/**
 * adds a estimate-number helper.
 */
export function estimateNumber(value) {
  return value.split(' ').filter(Boolean).length;
}

