
/**
 * adds an inclusive range helper.
 */
export function rangeArray(start, end, step = 1) {
  const out = [];
  if (step === 0) return out;
  if (start <= end) {
    if (step < 0) return out;
    for (let i = start; i <= end; i += step) out.push(i);
  } else {
    for (let i = start; i >= end; i -= Math.abs(step)) out.push(i);
  }
  return out;
}

