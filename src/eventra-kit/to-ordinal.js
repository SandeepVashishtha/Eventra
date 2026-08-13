
/**
 * adds an ordinal helper.
 */
export function toOrdinal(value) {
  const n = Math.abs(value);
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  const mod10 = n % 10;
  const suffix = mod10 === 1 ? 'st' : mod10 === 2 ? 'nd' : mod10 === 3 ? 'rd' : 'th';
  return `${value}${suffix}`;
}

