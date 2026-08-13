/**
 * Dynamic Ticket QR Payload (#13903)
 *
 * The QR value encodes ONLY the opaque, server-issued ticket identifier
 * (qrToken / registrationId). A rotating token derived from a keyless hash of
 * public data (ticketId + timestamp) is trivially recomputable by anyone who
 * knows the ticketId, so it offered no anti-fraud protection. Because the
 * client bundle cannot hold a server-side secret, no client-side TOTP is
 * generated; ticket validity is enforced server-side at scan time via
 * `validateTicket` in TicketScanner.
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
 * Build the QR payload for a ticket. Returns only the opaque ticket identifier
 * so the encoded value matches the scanner's strict single-key contract
 * (issue #11073) and carries no forgeable claims.
 */
export const buildTicketQrPayload = ({ registration, serialNumber }) => {
  const ticketId = registration?.qrToken || registration?.registrationId || serialNumber || null;
  if (!ticketId) return null;
  return { ticketId };
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
