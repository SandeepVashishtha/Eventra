
/**
 * adds an exclusive range helper.
 */
export function exclusiveRange(start, end) {
  const out = [];
  for (let i = start; i < end; i++) out.push(i);
  return out;
}

