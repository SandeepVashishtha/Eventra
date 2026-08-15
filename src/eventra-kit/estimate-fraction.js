/**
 * adds a estimate-fraction helper.
 */
export function estimateFraction(value) {
  return value.filter((item, index) => index % 2 === 1);
}

