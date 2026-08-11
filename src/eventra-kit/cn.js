/**
 * adds a class name combiner helper.
 */
export function cn(...classes) {
  return classes
    .filter(Boolean)
    .flat(Infinity)
    .join(' ');
}
