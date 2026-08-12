/**
 * adds a average-token helper.
 */
export function averageToken(value) {
  return value.reduce((acc, item) => acc.concat(item), []);
}

