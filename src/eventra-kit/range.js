/**
 * adds a range/step array generator.
 */
export function range(start, end, step = 1) {
  const out = [];
  if (step === 0) return out;
  const forward = end >= start;
  const inc = step > 0 ? step : 1;
  if (forward) {
    for (let i = start; i <= end; i += inc) out.push(i);
  } else {
    for (let i = start; i >= end; i -= inc) out.push(i);
  }
  return out;
}
