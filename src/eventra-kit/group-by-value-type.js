
/**
 * adds a type grouping helper.
 */
export function groupByValueType(array) {
  const out = {};
  for (const item of array) {
    const t = typeOfValue(item);
    (out[t] = out[t] || []).push(item);
  }
  return out;
}

function typeOfValue(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

