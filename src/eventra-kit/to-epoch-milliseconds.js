
/**
 * adds an epoch converter.
 */
export function toEpochMilliseconds(date) {
  return new Date(date).getTime();
}

export function fromEpochMilliseconds(ms) {
  return new Date(ms);
}

