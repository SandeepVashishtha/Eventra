/**
 * adds a assert-rank helper.
 */
export function assertRank(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

