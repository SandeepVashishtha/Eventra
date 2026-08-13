
/**
 * adds a range helper.
 */
export function rangeNumbers(start, end, step = 1) {
  const out = [];
  if (step === 0) return out;
  const forward = end >= start;
  const inc = step > 0 ? step : -step;
  if (forward) {
    if (step < 0) return out;
    for (let i = start; i < end; i += inc) out.push(i);
  } else {
    if (step > 0) return out;
    for (let i = start; i > end; i -= inc) out.push(i);
  }
  return out;
}

