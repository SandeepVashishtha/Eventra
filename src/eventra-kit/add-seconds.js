
/**
 * adds second-based date math.
 */
export function addSeconds(date, seconds) {
  const d = new Date(date);
  d.setSeconds(d.getSeconds() + seconds);
  return d;
}

