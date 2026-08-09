/**
 * Registration Duplicate Detection utilities.
 *
 * These helpers keep duplicate-registration checks
 * independent from the registration UI.
 */

/**
 * Registration statuses that should be treated
 * as an existing registration.
 */
export const REGISTRATION_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  APPROVED: "approved",
  WAITLISTED: "waitlisted",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
};

/**
 * Normalize an ID so comparisons are consistent.
 */
export const normalizeId = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

/**
 * Get a user's ID from common object shapes.
 */
export const getUserId = (user = {}) => {
  return normalizeId(
    user.id ??
      user.userId ??
      user.user_id ??
      user.participantId
  );
};

/**
 * Get an event's ID from common object shapes.
 */
export const getEventId = (event = {}) => {
  return normalizeId(
    event.id ??
      event.eventId ??
      event.event_id
  );
};

/**
 * Get a registration's ID.
 */
export const getRegistrationId = (
  registration = {}
) => {
  return normalizeId(
    registration.id ??
      registration.registrationId ??
      registration.registration_id
  );
};

/**
 * Get the user ID associated with a registration.
 */
export const getRegistrationUserId = (
  registration = {}
) => {
  return normalizeId(
    registration.userId ??
      registration.user_id ??
      registration.participantId ??
      registration.participant?.id ??
      registration.user?.id
  );
};

/**
 * Get the event ID associated with a registration.
 */
export const getRegistrationEventId = (
  registration = {}
) => {
  return normalizeId(
    registration.eventId ??
      registration.event_id ??
      registration.event?.id
  );
};

/**
 * Get a normalized registration status.
 */
export const getRegistrationStatus = (
  registration = {}
) => {
  return String(
    registration.status ||
      REGISTRATION_STATUSES.CONFIRMED
  )
    .trim()
    .toLowerCase();
};

/**
 * Check whether a registration is cancelled.
 */
export const isCancelledRegistration = (
  registration = {}
) => {
  return (
    getRegistrationStatus(
      registration
    ) ===
    REGISTRATION_STATUSES.CANCELLED
  );
};

/**
 * Check whether a registration is rejected.
 */
export const isRejectedRegistration = (
  registration = {}
) => {
  return (
    getRegistrationStatus(
      registration
    ) ===
    REGISTRATION_STATUSES.REJECTED
  );
};

/**
 * Check whether a registration should
 * count as an existing registration.
 *
 * Cancelled/rejected registrations do not
 * block a fresh registration by default.
 */
export const isActiveRegistration = (
  registration = {}
) => {
  const status =
    getRegistrationStatus(
      registration
    );

  return (
    status !==
      REGISTRATION_STATUSES.CANCELLED &&
    status !==
      REGISTRATION_STATUSES.REJECTED
  );
};

/**
 * Compare two IDs safely.
 */
export const idsMatch = (
  firstId,
  secondId
) => {
  const first =
    normalizeId(firstId);

  const second =
    normalizeId(secondId);

  return (
    Boolean(first) &&
    Boolean(second) &&
    first === second
  );
};

/**
 * Check whether a registration belongs
 * to a specific user and event.
 */
export const registrationMatches = (
  registration,
  userId,
  eventId
) => {
  if (!registration) {
    return false;
  }

  return (
    idsMatch(
      getRegistrationUserId(
        registration
      ),
      userId
    ) &&
    idsMatch(
      getRegistrationEventId(
        registration
      ),
      eventId
    )
  );
};

/**
 * Find an existing registration for a
 * specific user and event.
 */
export const findExistingRegistration = (
  registrations = [],
  userId,
  eventId
) => {
  if (!Array.isArray(registrations)) {
    return null;
  }

  return (
    registrations.find(
      (registration) =>
        registrationMatches(
          registration,
          userId,
          eventId
        ) &&
        isActiveRegistration(
          registration
        )
    ) || null
  );
};

/**
 * Check whether a user is already registered
 * for an event.
 */
export const isUserAlreadyRegistered = ({
  registrations = [],
  userId,
  eventId,
} = {}) => {
  return Boolean(
    findExistingRegistration(
      registrations,
      userId,
      eventId
    )
  );
};

/**
 * Return the existing registration status.
 */
export const getExistingRegistrationStatus = ({
  registrations = [],
  userId,
  eventId,
} = {}) => {
  const registration =
    findExistingRegistration(
      registrations,
      userId,
      eventId
    );

  if (!registration) {
    return null;
  }

  return getRegistrationStatus(
    registration
  );
};

/**
 * Get the existing registration ID.
 */
export const getExistingRegistrationId = ({
  registrations = [],
  userId,
  eventId,
} = {}) => {
  const registration =
    findExistingRegistration(
      registrations,
      userId,
      eventId
    );

  if (!registration) {
    return null;
  }

  return getRegistrationId(
    registration
  );
};

/**
 * Build a link to an existing registration.
 *
 * The caller can provide a custom route builder
 * when the application's routing structure differs.
 */
export const getExistingRegistrationUrl = ({
  registration,
  registrationId,
  basePath = "/registrations",
} = {}) => {
  const id =
    registrationId ||
    getRegistrationId(
      registration
    );

  if (!id) {
    return null;
  }

  const normalizedBasePath =
    String(basePath)
      .replace(/\/+$/, "")
      .replace(/^\/?/, "/");

  return `${normalizedBasePath}/${encodeURIComponent(
    id
  )}`;
};

/**
 * Create a complete duplicate-check result.
 */
export const checkForDuplicateRegistration = ({
  registrations = [],
  userId,
  eventId,
  registrationBasePath = "/registrations",
} = {}) => {
  const existingRegistration =
    findExistingRegistration(
      registrations,
      userId,
      eventId
    );

  if (!existingRegistration) {
    return {
      isDuplicate: false,
      alreadyRegistered: false,
      existingRegistration: null,
      registrationId: null,
      status: null,
      registrationUrl: null,
      message: null,
    };
  }

  const registrationId =
    getRegistrationId(
      existingRegistration
    );

  const status =
    getRegistrationStatus(
      existingRegistration
    );

  return {
    isDuplicate: true,
    alreadyRegistered: true,
    existingRegistration,
    registrationId,
    status,
    registrationUrl:
      getExistingRegistrationUrl({
        registration:
          existingRegistration,
        registrationId,
        basePath:
          registrationBasePath,
      }),
    message:
      getDuplicateRegistrationMessage(
        status
      ),
  };
};

/**
 * Generate a user-friendly duplicate message.
 */
export const getDuplicateRegistrationMessage = (
  status
) => {
  switch (String(status).toLowerCase()) {
    case REGISTRATION_STATUSES.PENDING:
      return "You already have a pending registration for this event.";

    case REGISTRATION_STATUSES.WAITLISTED:
      return "You are already on the waitlist for this event.";

    case REGISTRATION_STATUSES.APPROVED:
      return "Your registration for this event has been approved.";

    case REGISTRATION_STATUSES.CONFIRMED:
      return "You are already registered for this event.";

    default:
      return "You already have a registration for this event.";
  }
};

/**
 * Check whether a registration can be submitted.
 */
export const canSubmitRegistration = ({
  registrations = [],
  userId,
  eventId,
} = {}) => {
  return !isUserAlreadyRegistered({
    registrations,
    userId,
    eventId,
  });
};

/**
 * Get a registration guard result before
 * submitting a registration.
 */
export const getRegistrationGuardResult = ({
  registrations = [],
  userId,
  eventId,
  registrationBasePath = "/registrations",
} = {}) => {
  const duplicate =
    checkForDuplicateRegistration({
      registrations,
      userId,
      eventId,
      registrationBasePath,
    });

  return {
    allowed: !duplicate.isDuplicate,
    blocked: duplicate.isDuplicate,
    ...duplicate,
  };
};

/**
 * Detect repeated submissions using a local
 * submission key.
 *
 * This is useful for preventing rapid repeated
 * clicks before the backend responds.
 */
export const createRegistrationSubmissionKey = ({
  userId,
  eventId,
} = {}) => {
  const normalizedUserId =
    normalizeId(userId);

  const normalizedEventId =
    normalizeId(eventId);

  if (
    !normalizedUserId ||
    !normalizedEventId
  ) {
    return null;
  }

  return `registration:${normalizedUserId}:${normalizedEventId}`;
};

/**
 * Check whether a submission key already exists.
 */
export const hasPendingSubmission = (
  pendingSubmissions,
  submissionKey
) => {
  if (!submissionKey) {
    return false;
  }

  if (
    pendingSubmissions instanceof Set
  ) {
    return pendingSubmissions.has(
      submissionKey
    );
  }

  if (
    Array.isArray(
      pendingSubmissions
    )
  ) {
    return pendingSubmissions.includes(
      submissionKey
    );
  }

  if (
    pendingSubmissions &&
    typeof pendingSubmissions ===
      "object"
  ) {
    return Boolean(
      pendingSubmissions[
        submissionKey
      ]
    );
  }

  return false;
};

/**
 * Add a pending submission key.
 */
export const addPendingSubmission = (
  pendingSubmissions,
  submissionKey
) => {
  if (!submissionKey) {
    return pendingSubmissions;
  }

  if (
    pendingSubmissions instanceof Set
  ) {
    const next = new Set(
      pendingSubmissions
    );

    next.add(submissionKey);

    return next;
  }

  if (
    Array.isArray(
      pendingSubmissions
    )
  ) {
    if (
      pendingSubmissions.includes(
        submissionKey
      )
    ) {
      return pendingSubmissions;
    }

    return [
      ...pendingSubmissions,
      submissionKey,
    ];
  }

  return {
    ...(pendingSubmissions || {}),
    [submissionKey]: true,
  };
};

/**
 * Remove a pending submission key.
 */
export const removePendingSubmission = (
  pendingSubmissions,
  submissionKey
) => {
  if (!submissionKey) {
    return pendingSubmissions;
  }

  if (
    pendingSubmissions instanceof Set
  ) {
    const next = new Set(
      pendingSubmissions
    );

    next.delete(
      submissionKey
    );

    return next;
  }

  if (
    Array.isArray(
      pendingSubmissions
    )
  ) {
    return pendingSubmissions.filter(
      (key) =>
        key !== submissionKey
    );
  }

  if (
    pendingSubmissions &&
    typeof pendingSubmissions ===
      "object"
  ) {
    const next = {
      ...pendingSubmissions,
    };

    delete next[
      submissionKey
    ];

    return next;
  }

  return pendingSubmissions;
};

/**
 * Find all registrations for a user.
 */
export const getUserRegistrations = (
  registrations = [],
  userId
) => {
  if (!Array.isArray(registrations)) {
    return [];
  }

  return registrations.filter(
    (registration) =>
      idsMatch(
        getRegistrationUserId(
          registration
        ),
        userId
      )
  );
};

/**
 * Find all registrations for an event.
 */
export const getEventRegistrations = (
  registrations = [],
  eventId
) => {
  if (!Array.isArray(registrations)) {
    return [];
  }

  return registrations.filter(
    (registration) =>
      idsMatch(
        getRegistrationEventId(
          registration
        ),
        eventId
      )
  );
};

/**
 * Count active registrations for an event.
 */
export const countActiveEventRegistrations = (
  registrations = [],
  eventId
) => {
  return getEventRegistrations(
    registrations,
    eventId
  ).filter(
    isActiveRegistration
  ).length;
};

/**
 * Remove duplicate registration records
 * while preserving the first active record.
 */
export const removeDuplicateRegistrations = (
  registrations = []
) => {
  if (!Array.isArray(registrations)) {
    return [];
  }

  const seen = new Set();

  return registrations.filter(
    (registration) => {
      const userId =
        getRegistrationUserId(
          registration
        );

      const eventId =
        getRegistrationEventId(
          registration
        );

      /*
       * If either identifier is unavailable,
       * keep the record instead of making an
       * unsafe assumption.
       */
      if (!userId || !eventId) {
        return true;
      }

      const key = `${userId}:${eventId}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    }
  );
};

/**
 * Get a duplicate-registration summary
 * for an event.
 */
export const getDuplicateRegistrationSummary = ({
  registrations = [],
  userId,
  eventId,
} = {}) => {
  const matchingRegistrations =
    getEventRegistrations(
      registrations,
      eventId
    ).filter(
      (registration) =>
        idsMatch(
          getRegistrationUserId(
            registration
          ),
          userId
        )
    );

  const activeRegistrations =
    matchingRegistrations.filter(
      isActiveRegistration
    );

  return {
    totalMatches:
      matchingRegistrations.length,
    activeMatches:
      activeRegistrations.length,
    hasDuplicate:
      activeRegistrations.length > 0,
    registrations:
      matchingRegistrations,
    activeRegistration:
      activeRegistrations[0] ||
      null,
  };
};

/**
 * Check whether the same user/event pair
 * exists more than once.
 */
export const hasDuplicateRecords = (
  registrations = [],
  userId,
  eventId
) => {
  const summary =
    getDuplicateRegistrationSummary({
      registrations,
      userId,
      eventId,
    });

  return (
    summary.activeMatches > 1
  );
};