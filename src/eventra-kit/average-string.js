/**
 * adds a average-string helper.
 */
export function averageString(value, index, item) {
  return value.slice(0, index).concat([item], value.slice(index));
}

