
/**
 * adds a unix timestamp helper.
 */
export function getUnixTimestamp(date) {
  return Math.floor(new Date(date).getTime() / 1000);
}

