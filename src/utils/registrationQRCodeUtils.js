export const QR_CODE_VERSION = "1.0";

/**
 * Build the data that will be encoded inside
 * the registration QR code.
 */
export const buildQRCodePayload = (
  registration = {}
) => {
  if (!registration) {
    return null;
  }

  const participant =
    registration.participant ||
    {};

  return {
    version: QR_CODE_VERSION,
    type: "event-registration",

    registrationId:
      registration.registrationId ||
      registration.id ||
      "",

    eventId:
      registration.eventId ||
      registration.event?.id ||
      "",

    participant: {
      id:
        participant.id ||
        registration.participantId ||
        "",
      name:
        participant.name ||
        registration.participantName ||
        registration.name ||
        "",
      email:
        participant.email ||
        registration.participantEmail ||
        "",
    },

    status:
      registration.status ||
      "Registered",
  };
};

/**
 * Validate the minimum information required
 * to generate a registration QR code.
 */
export const validateQRCodePayload = (
  payload
) => {
  const errors = [];

  if (!payload?.registrationId) {
    errors.push(
      "Registration ID is required."
    );
  }

  if (!payload?.eventId) {
    errors.push(
      "Event ID is required."
    );
  }

  if (
    !payload?.participant?.name &&
    !payload?.participant?.email
  ) {
    errors.push(
      "Participant information is required."
    );
  }

  if (!payload?.status) {
    errors.push(
      "Registration status is required."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Convert the QR payload into a JSON string.
 */
export const serializeQRCodePayload = (
  payload
) => {
  if (!payload) {
    return "";
  }

  return JSON.stringify(payload);
};

/**
 * Parse QR registration data back into
 * an object.
 */
export const parseQRCodePayload = (
  qrData
) => {
  if (!qrData) {
    return null;
  }

  try {
    const parsed =
      typeof qrData === "string"
        ? JSON.parse(qrData)
        : qrData;

    if (
      parsed?.type !==
      "event-registration"
    ) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error(
      "Failed to parse registration QR data:",
      error
    );

    return null;
  }
};

/**
 * Check whether a registration is eligible
 * for QR code generation.
 */
export const canGenerateQRCode = (
  registration
) => {
  if (!registration) {
    return false;
  }

  const status = String(
    registration.status ||
      "Registered"
  )
    .trim()
    .toLowerCase();

  const invalidStatuses = [
    "cancelled",
    "canceled",
    "rejected",
    "failed",
  ];

  return !invalidStatuses.includes(
    status
  );
};

/**
 * Generate a safe filename for downloading
 * the registration QR code.
 */
export const getQRCodeFileName = (
  registration
) => {
  const registrationId =
    registration?.registrationId ||
    registration?.id ||
    "registration";

  const safeId = String(
    registrationId
  ).replace(
    /[^a-zA-Z0-9-_]/g,
    "-"
  );

  return `event-registration-${safeId}-qr.png`;
};

/**
 * Create a compact display summary for the
 * QR code.
 */
export const getQRCodeSummary = (
  registration
) => {
  const payload =
    buildQRCodePayload(
      registration
    );

  if (!payload) {
    return null;
  }

  return {
    registrationId:
      payload.registrationId,
    eventId: payload.eventId,
    participantName:
      payload.participant.name,
    participantEmail:
      payload.participant.email,
    status: payload.status,
  };
};

/**
 * Check whether QR data belongs to a valid
 * Eventra registration.
 */
export const isValidRegistrationQRCode = (
  qrData
) => {
  const payload =
    parseQRCodePayload(qrData);

  if (!payload) {
    return false;
  }

  return (
    validateQRCodePayload(
      payload
    ).valid
  );
};