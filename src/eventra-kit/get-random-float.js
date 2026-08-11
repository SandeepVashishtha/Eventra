
/**
 * adds a random float helper.
 */
export function getRandomFloat(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

