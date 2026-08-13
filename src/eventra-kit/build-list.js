/**
 * adds a build-list helper.
 */
export function buildList(value) {
  return value.split(' ').filter(Boolean).length;
}

