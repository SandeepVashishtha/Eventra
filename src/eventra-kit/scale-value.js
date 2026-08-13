
/**
 * adds a value scaler.
 */
export function scaleValue(value, inMin, inMax, outMin, outMax) {
  const ratio = (value - inMin) / (inMax - inMin);
  return outMin + ratio * (outMax - outMin);
}

