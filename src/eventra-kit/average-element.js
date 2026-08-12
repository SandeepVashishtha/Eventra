/**
 * adds a average-element helper.
 */
export function averageElement(value) {
  return Array.isArray(value) ? value.length : String(value).length;
}

