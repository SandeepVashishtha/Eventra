
/**
 * adds random number helpers.
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

export function pickRandom(items) {
  if (!items.length) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

