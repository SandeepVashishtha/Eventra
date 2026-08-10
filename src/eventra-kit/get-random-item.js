
/**
 * adds a random item picker.
 */
export function getRandomItem(array) {
  return array.length ? array[Math.floor(Math.random() * array.length)] : undefined;
}

