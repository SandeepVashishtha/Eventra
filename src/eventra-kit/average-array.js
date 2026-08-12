/**
 * adds a average-array helper.
 */
export function averageArray(value) {
  return value.filter((item, index) => index % 2 === 1);
}

