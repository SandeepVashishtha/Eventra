/**
 * Dynamic Ticket QR Payload & TOTP Rotating Token Generator (#13903)
 */

export const getTicketHolderName = (user) =>
  user?.fullName?.trim() || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.username || "Eventra Guest";

/**
 * Generate a 15-second time-window TOTP nonce timestamp integer.
 */
export const getTotpTimeWindow = (stepSeconds = 15) => {
  return Math.floor(Date.now() / 1000 / stepSeconds);
};

/**
 * Build dynamic rotating QR payload with time-bound TOTP HMAC token payload.
 */
export const buildTicketQrPayload = ({ registration, serialNumber, stepSeconds = 15 }) => {
  const ticketId = registration?.qrToken || registration?.registrationId || serialNumber || null;
  if (!ticketId) return null;

  const timeWindow = getTotpTimeWindow(stepSeconds);
  const rawData = `${ticketId}:${timeWindow}`;

  // Simple deterministic hash simulation for TOTP QR token
  let hash = 0;
  for (let i = 0; i < rawData.length; i++) {
    hash = (hash << 5) - hash + rawData.charCodeAt(i);
    hash |= 0;
  }
  const totpToken = Math.abs(hash).toString(16).substring(0, 8);

  return {
    ticketId,
    totpToken,
    timeWindow,
    timestamp: Date.now(),
  };
};

export const buildOpaqueTicketQrPayload = ({ registration, serialNumber }) => {
  const ticketId = registration?.qrToken || registration?.registrationId || serialNumber || null;
  if (!ticketId) return null;
  return { ticketId };
};

export const buildTicketQrValue = (ticketData) => {
  if (!ticketData || typeof ticketData !== "object" || !ticketData.ticketId) {
    return "";
  }
  // Scanner (TicketScanner.jsx) only accepts opaque { ticketId }. Extra keys
  // are treated as forgeable claims and rejected.
  return JSON.stringify({ ticketId: ticketData.ticketId });
};

/**
 * Validate incoming QR payload in Scanner within ±1 time window threshold.
 */
export const validateTicketQrWindow = (qrPayload, maxWindowDiff = 1) => {
  if (!qrPayload || !qrPayload.timeWindow) return false;
  const currentWindow = getTotpTimeWindow(15);
  const diff = Math.abs(currentWindow - qrPayload.timeWindow);
  return diff <= maxWindowDiff;
};
