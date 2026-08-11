
/**
 * adds a sequence generator.
 */
export function sequence(count, mapper = (i) => i) {
  return Array.from({ length: count }, (_, i) => mapper(i));
}

