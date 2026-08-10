
/**
 * adds a random-sample helper.
 */
export function pickRandomItems(array, count) {
  const copy = [...array];
  const out = [];
  for (let i = 0; i < Math.min(count, copy.length); i++) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

