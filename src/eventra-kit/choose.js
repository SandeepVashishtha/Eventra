
/**
 * adds a weighted choice helper.
 */
export function choose(items, weights = null) {
  if (!items.length) return undefined;
  if (!weights) return items[Math.floor(Math.random() * items.length)];
  const total = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return items[i];
  }
  return items[items.length - 1];
}

