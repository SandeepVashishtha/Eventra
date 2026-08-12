/**
 * adds a average-prop helper.
 */
export function averageProp(value) {
  return String(value).match(/[0-9]/g)?.length ?? 0;
}

