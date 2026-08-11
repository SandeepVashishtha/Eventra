
/**
 * adds an elapsed-time helper.
 */
export function elapsedTimeBetween(start, end) {
  const ms = Math.max(0, new Date(end).getTime() - new Date(start).getTime());
  return {
    milliseconds: ms,
    seconds: ms / 1000,
    minutes: ms / 60000,
    hours: ms / 3600000,
    days: ms / 86400000,
  };
}

