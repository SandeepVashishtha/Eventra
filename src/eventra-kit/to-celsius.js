
/**
 * adds temperature conversion helpers.
 */
export function toCelsius(fahrenheit) {
  return (fahrenheit - 32) * 5 / 9;
}

export function toFahrenheit(celsius) {
  return celsius * 9 / 5 + 32;
}

