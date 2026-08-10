
/**
 * adds an inclusive range helper.
 */
export function rangeArray(start, end, step = 1) {
  const out = [];
  if (start <= end) {
    for (let i = start; i <= end; i += step) out.push(i);
  } else {
    for (let i = start; i >= end; i -= Math.abs(step)) out.push(i);
  }
  return out;
}

