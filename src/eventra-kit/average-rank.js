/**
 * adds a average-rank helper.
 */
export function averageRank(value) {
  return value.reduce((acc, item) => ({ ...acc, [item]: true }), {});
}

