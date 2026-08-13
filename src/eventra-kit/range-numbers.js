
/**
 * adds a range helper.
 */
export function rangeNumbers(start, end, step = 1) {
  const out = [];
  for (let i = start; i < end; i += step) out.push(i);
  return out;
}

