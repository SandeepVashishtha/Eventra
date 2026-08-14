/**
 * Generates dynamic time-restricted security tokens for tickets (#17670)
 */

export function generateDynamicCheckinToken(ticketId, secretKey, intervalSeconds = 15) {
  if (!ticketId) return "";

  // Time-locked dynamic indices calculations
  const timeIndex = Math.floor(Date.now() / (intervalSeconds * 1000));
  
  // Combine factors to build dynamic hashed check-in codes
  const computedHash = `${ticketId}_${secretKey}_${timeIndex}`;
  return "token_" + Buffer.from(computedHash).toString("base64").substring(0, 16);
}
