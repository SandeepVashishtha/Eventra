
/**
 * adds an array zipper.
 */
export function zipArrays(first, second) {
  return first.map((item, i) => [item, second[i]]);
}

