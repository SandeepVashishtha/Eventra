/**
 * adds a count-time helper.
 */
export function countTime(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

