
/**
 * adds a random color helper.
 */
export function randomColorHex() {
  return `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`.toUpperCase();
}

