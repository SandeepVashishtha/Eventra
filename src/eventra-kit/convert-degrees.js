
/**
 * adds a degree conversion helper.
 */
export function convertDegrees(value, from, to) {
  if (from === to) return value;
  let celsius;
  if (from === 'C') celsius = value;
  else if (from === 'F') celsius = ((value - 32) * 5) / 9;
  else celsius = value - 273.15;
  if (to === 'C') return celsius;
  if (to === 'F') return (celsius * 9) / 5 + 32;
  return celsius + 273.15;
}

