/**
 * adds a average-hash helper.
 */
export function averageHash(value) {
  return value.split(' ').filter(Boolean).length;
}

