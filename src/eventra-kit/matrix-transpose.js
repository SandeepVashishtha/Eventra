
/**
 * adds a matrix transpose helper.
 */
export function matrixTranspose(matrix) {
  if (!matrix.length || !matrix[0].length) return [];
  return matrix[0].map((_, col) => matrix.map((row) => row[col]));
}

