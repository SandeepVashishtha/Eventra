
/**
 * adds temperature conversion.
 */
export function celsiusToFahrenheit(celsius) {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit) {
  return ((fahrenheit - 32) * 5) / 9;
}

