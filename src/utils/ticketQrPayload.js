export const getTicketHolderName = (user) =>
  user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.username || "Eventra Guest";

export const buildTicketQrPayload = ({ event, user, registration, serialNumber }) => {
  const ticketId = registration?.qrToken || registration?.registrationId || serialNumber;
  const eventId = event?.id ?? event?.eventId;

  return {
    ticketId,
    registrationId: registration?.registrationId || serialNumber,
    eventId,
    eventName: event?.title || "Eventra Event",
    userName: getTicketHolderName(user),
  };
};

export const buildTicketQrValue = (ticketData) => JSON.stringify(ticketData);
