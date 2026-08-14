/**
 * Spatial Audio distance-attenuation calculations helper (#17669)
 */

export function calculateDistanceGain(x1, y1, x2, y2, maxDistance = 400, rolloffFactor = 1) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance >= maxDistance) return 0;
  if (distance <= 0) return 1;

  // Attenuation formula mapping distance to logarithmic sound gains
  const gain = 1 - (distance / maxDistance) * rolloffFactor;
  return Math.max(0, Math.min(1, gain));
}
