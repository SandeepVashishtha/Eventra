export const getTicketHolderName = (user) =>
  user?.fullName?.trim() || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.username || "Eventra Guest";

/**
 * Build the QR payload for an event ticket.
 *
 * SECURITY: The QR encodes ONLY the opaque, server-issued ticket token
 * (qrToken, or registrationId as a fallback) — no PII such as attendee names,
 * event names, or registrations is embedded. Attendee/event details are
 * display-only and are resolved server-side during ticket validation.
 *
 * Returns null when no server-issued token is available; callers must not
 * render a QR code in that case (a generated pseudo-serial would be forgeable).
 */
export const buildTicketQrPayload = ({ registration, serialNumber }) => {
  const ticketId = registration?.qrToken || registration?.registrationId || serialNumber || null;
  if (!ticketId) return null;
  return { ticketId };
};

export const buildTicketQrValue = (ticketData) => {
  if (!ticketData || typeof ticketData !== "object" || !ticketData.ticketId) {
    return "";
  }
  return JSON.stringify(ticketData);
};
