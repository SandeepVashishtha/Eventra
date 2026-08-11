
/**
 * adds a random filename helper.
 */
export function randomFileName(extension = 'txt') {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
}

