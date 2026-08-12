
/**
 * adds a cubes sum helper.
 */
export function sumOfCubes(array) {
  return array.reduce((acc, v) => acc + v * v * v, 0);
}

