
/**
 * adds a random hex generator.
 */
export function randomHex(length = 6) {
  let out = '';
  for (let i = 0; i < length; i++) out += Math.floor(Math.random() * 16).toString(16);
  return out;
}

