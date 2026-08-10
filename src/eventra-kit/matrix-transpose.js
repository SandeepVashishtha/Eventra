
/**
 * adds a matrix transpose helper.
 */
export function matrixTranspose(matrix) {
  return matrix[0].map((_, col) => matrix.map((row) => row[col]));
}

