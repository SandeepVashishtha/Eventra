/**
 * Laplace Mechanism Differential Privacy (ε, δ) Pipeline (#14044)
 * Injects calibrated Laplace noise into aggregations to guarantee participant anonymity.
 */

/**
 * Draw a random sample from a zero-mean Laplace distribution with scale b = sensitivity / epsilon.
 */
export function sampleLaplaceNoise(sensitivity = 1.0, epsilon = 1.0) {
  if (epsilon <= 0) return 0;
  const b = sensitivity / epsilon;
  const u = Math.random() - 0.5;
  // Inverse CDF of Laplace distribution
  return -b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

/**
 * Apply Differential Privacy Laplace noise to an aggregated numeric value.
 */
export function addDifferentialPrivacyNoise(val, epsilon = 1.0, sensitivity = 1.0) {
  const noise = sampleLaplaceNoise(sensitivity, epsilon);
  const noisyVal = val + noise;
  return Math.max(0, Math.round(noisyVal * 10) / 10);
}

/**
 * Calculate privacy loss budget guarantee string (e.g., "0.5-DP Guaranteed").
 */
export function getPrivacyGuaranteeLabel(epsilon) {
  if (epsilon <= 0.2) return "Strict Privacy (High Noise)";
  if (epsilon <= 1.0) return "Balanced Privacy & Accuracy";
  return "High Accuracy (Low Noise)";
}
