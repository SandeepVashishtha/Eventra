/**
 * adds a average-portion helper.
 */
export function averagePortion(value) {
  return String(value).match(/[a-z]/gi)?.length ?? 0;
}

