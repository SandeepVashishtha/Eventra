
/**
 * adds an alternating cAsE helper.
 */
export function alternateCase(str) {
  let out = '';
  for (let i = 0; i < String(str).length; i++) {
    out += i % 2 === 0 ? String(str)[i].toUpperCase() : String(str)[i].toLowerCase();
  }
  return out;
}

