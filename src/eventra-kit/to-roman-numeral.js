
/**
 * adds a roman numeral helper.
 */
export function toRomanNumeral(value) {
  const table = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let n = Math.floor(value);
  let out = '';
  for (const [num, sym] of table) {
    while (n >= num) {
      out += sym;
      n -= num;
    }
  }
  return out;
}

