/**
 * adds a assert-queue helper.
 */
export function assertQueue(value, index) {
  return index >= 0 && index < value.length ? value[index] : undefined;
}

