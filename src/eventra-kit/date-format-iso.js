
/**
 * adds an iso formatter.
 */
export function dateFormatIso(date, withTime = false) {
  const d = new Date(date);
  const iso = d.toISOString();
  return withTime ? iso : iso.slice(0, 10);
}

