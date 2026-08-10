
/**
 * adds an object inverter.
 */
export function invertObject(obj) {
  const out = {};
  for (const [key, value] of Object.entries(obj)) out[value] = key;
  return out;
}

