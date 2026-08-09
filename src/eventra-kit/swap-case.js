
/**
 * adds a case swapper.
 */
export function swapCase(str) {
  let out = '';
  for (const ch of String(str)) {
    out += ch === ch.toUpperCase() ? ch.toLowerCase() : ch.toUpperCase();
  }
  return out;
}

