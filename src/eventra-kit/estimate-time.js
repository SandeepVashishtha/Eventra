/**
 * adds a estimate-time helper.
 */
export function estimateTime(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

