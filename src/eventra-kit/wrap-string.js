
/**
 * adds a char wrapper.
 */
export function wrapString(str, width) {
  const out = [];
  for (let i = 0; i < str.length; i += width) out.push(str.slice(i, i + width));
  return out;
}

