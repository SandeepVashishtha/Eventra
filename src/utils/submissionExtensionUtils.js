/**
 * Submission Deadline Extension utilities.
 *
 * Supports:
 * - Creating extension requests
 * - Validating requests
 * - Approving/rejecting requests
 * - Organizer comments
 * - Decision tracking
 * - Request status filtering
 * - Deadline validation
 */

export const EXTENSION_REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const EXTENSION_REQUEST_ACTIONS = {
  CREATED: "created",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMMENTED: "commented",
};

export const DEFAULT_MAX_REASON_LENGTH = 2000;
export const DEFAULT_MAX_TEAM_INFO_LENGTH = 1000;
export const DEFAULT_MAX_COMMENT_LENGTH = 1000;

/**
 * Normalize an identifier.
 */
export const normalizeExtensionId = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

/**
 * Generate a unique request ID.
 */
export const generateExtensionRequestId = () => {
  return `extension-request-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

/**
 * Generate a unique decision ID.
 */
export const generateExtensionDecisionId =
  () => {
    return `extension-decision-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  };

/**
 * Normalize a text value.
 */
export const normalizeExtensionText = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
};

/**
 * Convert a value to a valid Date.
 */
export const toExtensionDate = (
  value
) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
};

/**
 * Check whether a date value is valid.
 */
export const isValidExtensionDate = (
  value
) => {
  return Boolean(
    toExtensionDate(value)
  );
};

/**
 * Check whether the requested deadline
 * is later than the current deadline.
 */
export const isDeadlineAfterCurrentDeadline =
  (
    requestedDeadline,
    originalDeadline
  ) => {
    const requested =
      toExtensionDate(
        requestedDeadline
      );

    const original =
      toExtensionDate(
        originalDeadline
      );

    if (
      !requested ||
      !original
    ) {
      return false;
    }

    return (
      requested.getTime() >
      original.getTime()
    );
  };

/**
 * Check whether a requested deadline
 * is in the future.
 */
export const isDeadlineInFuture = (
  requestedDeadline,
  now = new Date()
) => {
  const requested =
    toExtensionDate(
      requestedDeadline
    );

  const current =
    toExtensionDate(now);

  if (
    !requested ||
    !current
  ) {
    return false;
  }

  return (
    requested.getTime() >
    current.getTime()
  );
};

/**
 * Validate a requested deadline.
 */
export const validateRequestedDeadline = ({
  requestedDeadline,
  originalDeadline,
  now = new Date(),
} = {}) => {
  const errors = [];

  if (!requestedDeadline) {
    errors.push(
      "A requested new deadline is required."
    );

    return {
      valid: false,
      errors,
    };
  }

  if (
    !isValidExtensionDate(
      requestedDeadline
    )
  ) {
    errors.push(
      "The requested deadline is invalid."
    );

    return {
      valid: false,
      errors,
    };
  }

  if (
    originalDeadline &&
    !isValidExtensionDate(
      originalDeadline
    )
  ) {
    errors.push(
      "The current submission deadline is invalid."
    );
  }

  if (
    !isDeadlineInFuture(
      requestedDeadline,
      now
    )
  ) {
    errors.push(
      "The requested deadline must be in the future."
    );
  }

  if (
    originalDeadline &&
    isValidExtensionDate(
      originalDeadline
    ) &&
    !isDeadlineAfterCurrentDeadline(
      requestedDeadline,
      originalDeadline
    )
  ) {
    errors.push(
      "The requested deadline must be later than the current submission deadline."
    );
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
};

/**
 * Validate the extension reason.
 */
export const validateExtensionReason = (
  reason,
  maxLength = DEFAULT_MAX_REASON_LENGTH
) => {
  const normalized =
    normalizeExtensionText(
      reason
    );

  const errors = [];

  if (!normalized) {
    errors.push(
      "A reason for the extension is required."
    );
  }

  if (
    normalized.length >
    maxLength
  ) {
    errors.push(
      `The reason cannot exceed ${maxLength} characters.`
    );
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
};

/**
 * Validate team information.
 */
export const validateTeamInformation = (
  teamInformation,
  maxLength = DEFAULT_MAX_TEAM_INFO_LENGTH
) => {
  const normalized =
    normalizeExtensionText(
      teamInformation
    );

  const errors = [];

  if (!normalized) {
    errors.push(
      "Team information is required."
    );
  }

  if (
    normalized.length >
    maxLength
  ) {
    errors.push(
      `Team information cannot exceed ${maxLength} characters.`
    );
  }

  return {
    valid:
      errors.length === 0,
    errors,
  };
};

/**
 * Validate a complete extension request.
 */
export const validateExtensionRequest = ({
  eventId,
  participantId,
  submissionId = "",
  reason,
  requestedDeadline,
  teamInformation,
  originalDeadline = "",
  now = new Date(),
} = {}) => {
  const errors = [];

  if (
    !normalizeExtensionId(
      eventId
    )
  ) {
    errors.push(
      "Event ID is required."
    );
  }

  if (
    !normalizeExtensionId(
      participantId
    )
  ) {
    errors.push(
      "Participant ID is required."
    );
  }

  if (
    submissionId !== undefined &&
    submissionId !== null &&
    typeof submissionId !==
      "string" &&
    typeof submissionId !==
      "number"
  ) {
    errors.push(
      "Submission ID is invalid."
    );
  }

  const reasonResult =
    validateExtensionReason(
      reason
    );

  errors.push(
    ...reasonResult.errors
  );

  const teamResult =
    validateTeamInformation(
      teamInformation
    );

  errors.push(
    ...teamResult.errors
  );

  const deadlineResult =
    validateRequestedDeadline({
      requestedDeadline,
      originalDeadline,
      now,
    });

  errors.push(
    ...deadlineResult.errors
  );

  return {
    valid:
      errors.length === 0,
    errors,
  };
};

/**
 * Create a new submission extension request.
 */
export const createExtensionRequest = ({
  eventId,
  participantId,
  submissionId = "",
  reason = "",
  requestedDeadline = "",
  teamInformation = "",
  originalDeadline = "",
} = {}) => {
  const now =
    new Date().toISOString();

  return {
    id:
      generateExtensionRequestId(),

    eventId:
      normalizeExtensionId(
        eventId
      ),

    participantId:
      normalizeExtensionId(
        participantId
      ),

    submissionId:
      normalizeExtensionId(
        submissionId
      ),

    reason:
      normalizeExtensionText(
        reason
      ),

    requestedDeadline:
      normalizeExtensionText(
        requestedDeadline
      ),

    originalDeadline:
      normalizeExtensionText(
        originalDeadline
      ),

    teamInformation:
      normalizeExtensionText(
        teamInformation
      ),

    status:
      EXTENSION_REQUEST_STATUS.PENDING,

    requestedAt: now,

    decidedAt: null,

    decidedBy: null,

    decisionComment: "",

    decisionId: null,

    updatedAt: now,
  };
};

/**
 * Find a request by ID.
 */
export const findExtensionRequest = (
  requests = [],
  requestId
) => {
  if (
    !Array.isArray(
      requests
    )
  ) {
    return null;
  }

  const normalizedId =
    normalizeExtensionId(
      requestId
    );

  return (
    requests.find(
      (request) =>
        normalizeExtensionId(
          request.id
        ) === normalizedId
    ) || null
  );
};

/**
 * Find a request for a participant
 * and event.
 */
export const findParticipantExtensionRequest =
  (
    requests = [],
    eventId,
    participantId
  ) => {
    if (
      !Array.isArray(
        requests
      )
    ) {
      return null;
    }

    const normalizedEventId =
      normalizeExtensionId(
        eventId
      );

    const normalizedParticipantId =
      normalizeExtensionId(
        participantId
      );

    return (
      requests.find(
        (request) =>
          normalizeExtensionId(
            request.eventId
          ) ===
            normalizedEventId &&
          normalizeExtensionId(
            request.participantId
          ) ===
            normalizedParticipantId
      ) || null
    );
  };

/**
 * Check whether a participant already
 * has a pending request.
 */
export const hasPendingExtensionRequest =
  (
    requests = [],
    eventId,
    participantId
  ) => {
    const request =
      findParticipantExtensionRequest(
        requests,
        eventId,
        participantId
      );

    return (
      request?.status ===
      EXTENSION_REQUEST_STATUS.PENDING
    );
  };

/**
 * Add a request to a collection.
 */
export const addExtensionRequest = (
  requests = [],
  request
) => {
  if (!request) {
    return Array.isArray(
      requests
    )
      ? [...requests]
      : [];
  }

  if (
    findExtensionRequest(
      requests,
      request.id
    )
  ) {
    return Array.isArray(
      requests
    )
      ? [...requests]
      : [];
  }

  return [
    ...(Array.isArray(
      requests
    )
      ? requests
      : []),
    request,
  ];
};

/**
 * Approve an extension request.
 */
export const approveExtensionRequest = (
  requests = [],
  requestId,
  organizerId,
  comment = ""
) => {
  if (
    !Array.isArray(
      requests
    )
  ) {
    return [];
  }

  const normalizedId =
    normalizeExtensionId(
      requestId
    );

  const normalizedOrganizerId =
    normalizeExtensionId(
      organizerId
    );

  const now =
    new Date().toISOString();

  return requests.map(
    (request) => {
      if (
        normalizeExtensionId(
          request.id
        ) !== normalizedId
      ) {
        return request;
      }

      return {
        ...request,

        status:
          EXTENSION_REQUEST_STATUS.APPROVED,

        decidedAt: now,

        decidedBy:
          normalizedOrganizerId,

        decisionComment:
          normalizeExtensionText(
            comment
          ),

        decisionId:
          generateExtensionDecisionId(),

        updatedAt: now,
      };
    }
  );
};

/**
 * Reject an extension request.
 */
export const rejectExtensionRequest = (
  requests = [],
  requestId,
  organizerId,
  comment = ""
) => {
  if (
    !Array.isArray(
      requests
    )
  ) {
    return [];
  }

  const normalizedId =
    normalizeExtensionId(
      requestId
    );

  const normalizedOrganizerId =
    normalizeExtensionId(
      organizerId
    );

  const now =
    new Date().toISOString();

  return requests.map(
    (request) => {
      if (
        normalizeExtensionId(
          request.id
        ) !== normalizedId
      ) {
        return request;
      }

      return {
        ...request,

        status:
          EXTENSION_REQUEST_STATUS.REJECTED,

        decidedAt: now,

        decidedBy:
          normalizedOrganizerId,

        decisionComment:
          normalizeExtensionText(
            comment
          ),

        decisionId:
          generateExtensionDecisionId(),

        updatedAt: now,
      };
    }
  );
};

/**
 * Add or update an organizer comment
 * without changing the request status.
 */
export const addExtensionRequestComment = (
  requests = [],
  requestId,
  organizerId,
  comment
) => {
  if (
    !Array.isArray(
      requests
    )
  ) {
    return [];
  }

  const normalizedId =
    normalizeExtensionId(
      requestId
    );

  const normalizedOrganizerId =
    normalizeExtensionId(
      organizerId
    );

  const normalizedComment =
    normalizeExtensionText(
      comment
    );

  if (!normalizedComment) {
    return [...requests];
  }

  const now =
    new Date().toISOString();

  return requests.map(
    (request) => {
      if (
        normalizeExtensionId(
          request.id
        ) !== normalizedId
      ) {
        return request;
      }

      return {
        ...request,

        decisionComment:
          normalizedComment,

        commentedBy:
          normalizedOrganizerId,

        commentedAt: now,

        updatedAt: now,
      };
    }
  );
};

/**
 * Get pending requests.
 */
export const getPendingExtensionRequests = (
  requests = []
) => {
  if (
    !Array.isArray(
      requests
    )
  ) {
    return [];
  }

  return requests.filter(
    (request) =>
      request.status ===
      EXTENSION_REQUEST_STATUS.PENDING
  );
};

/**
 * Get approved requests.
 */
export const getApprovedExtensionRequests = (
  requests = []
) => {
  if (
    !Array.isArray(
      requests
    )
  ) {
    return [];
  }

  return requests.filter(
    (request) =>
      request.status ===
      EXTENSION_REQUEST_STATUS.APPROVED
  );
};

/**
 * Get rejected requests.
 */
export const getRejectedExtensionRequests = (
  requests = []
) => {
  if (
    !Array.isArray(
      requests
    )
  ) {
    return [];
  }

  return requests.filter(
    (request) =>
      request.status ===
      EXTENSION_REQUEST_STATUS.REJECTED
  );
};

/**
 * Get requests for an event.
 */
export const getEventExtensionRequests = (
  requests = [],
  eventId
) => {
  if (
    !Array.isArray(
      requests
    )
  ) {
    return [];
  }

  const normalizedEventId =
    normalizeExtensionId(
      eventId
    );

  return requests.filter(
    (request) =>
      normalizeExtensionId(
        request.eventId
      ) === normalizedEventId
  );
};

/**
 * Get requests made by a participant.
 */
export const getParticipantExtensionRequests =
  (
    requests = [],
    participantId
  ) => {
    if (
      !Array.isArray(
        requests
      )
    ) {
      return [];
    }

    const normalizedParticipantId =
      normalizeExtensionId(
        participantId
      );

    return requests.filter(
      (request) =>
        normalizeExtensionId(
          request.participantId
        ) ===
        normalizedParticipantId
    );
  };

/**
 * Get the status label for UI display.
 */
export const getExtensionRequestStatusLabel =
  (status) => {
    const labels = {
      [EXTENSION_REQUEST_STATUS.PENDING]:
        "Pending",

      [EXTENSION_REQUEST_STATUS.APPROVED]:
        "Approved",

      [EXTENSION_REQUEST_STATUS.REJECTED]:
        "Rejected",
    };

    return (
      labels[status] ||
      "Unknown"
    );
  };

/**
 * Get the action label for activity logs.
 */
export const getExtensionRequestActionLabel =
  (action) => {
    const labels = {
      [EXTENSION_REQUEST_ACTIONS.CREATED]:
        "Request submitted",

      [EXTENSION_REQUEST_ACTIONS.APPROVED]:
        "Request approved",

      [EXTENSION_REQUEST_ACTIONS.REJECTED]:
        "Request rejected",

      [EXTENSION_REQUEST_ACTIONS.COMMENTED]:
        "Organizer commented",
    };

    return (
      labels[action] ||
      "Request updated"
    );
  };

/**
 * Create an activity record.
 */
export const createExtensionRequestActivity =
  ({
    requestId,
    eventId,
    actorId,
    action,
    details = "",
  } = {}) => {
    return {
      id:
        `extension-activity-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`,

      requestId:
        normalizeExtensionId(
          requestId
        ),

      eventId:
        normalizeExtensionId(
          eventId
        ),

      actorId:
        normalizeExtensionId(
          actorId
        ),

      action:
        normalizeExtensionText(
          action
        ),

      details:
        normalizeExtensionText(
          details
        ),

      timestamp:
        new Date().toISOString(),
    };
  };

/**
 * Calculate the requested extension
 * duration in milliseconds.
 */
export const getExtensionDurationMs = (
  originalDeadline,
  requestedDeadline
) => {
  const original =
    toExtensionDate(
      originalDeadline
    );

  const requested =
    toExtensionDate(
      requestedDeadline
    );

  if (
    !original ||
    !requested
  ) {
    return 0;
  }

  return (
    requested.getTime() -
    original.getTime()
  );
};

/**
 * Calculate the requested extension
 * duration in hours.
 */
export const getExtensionDurationHours = (
  originalDeadline,
  requestedDeadline
) => {
  const duration =
    getExtensionDurationMs(
      originalDeadline,
      requestedDeadline
    );

  if (duration <= 0) {
    return 0;
  }

  return duration / (
    1000 * 60 * 60
  );
};

/**
 * Calculate the requested extension
 * duration in days.
 */
export const getExtensionDurationDays = (
  originalDeadline,
  requestedDeadline
) => {
  const duration =
    getExtensionDurationMs(
      originalDeadline,
      requestedDeadline
    );

  if (duration <= 0) {
    return 0;
  }

  return duration / (
    1000 * 60 * 60 * 24
  );
};

/**
 * Get a readable extension duration.
 */
export const formatExtensionDuration = (
  originalDeadline,
  requestedDeadline
) => {
  const hours =
    getExtensionDurationHours(
      originalDeadline,
      requestedDeadline
    );

  if (hours <= 0) {
    return "No extension";
  }

  if (hours < 24) {
    return `${Math.round(
      hours
    )} hour${
      Math.round(hours) === 1
        ? ""
        : "s"
    }`;
  }

  const days =
    hours / 24;

  if (
    Number.isInteger(
      days
    )
  ) {
    return `${days} day${
      days === 1
        ? ""
        : "s"
    }`;
  }

  return `${days.toFixed(
    1
  )} days`;
};

/**
 * Get request summary statistics.
 */
export const getExtensionRequestSummary = (
  requests = []
) => {
  const safeRequests =
    Array.isArray(
      requests
    )
      ? requests
      : [];

  return {
    total:
      safeRequests.length,

    pending:
      getPendingExtensionRequests(
        safeRequests
      ).length,

    approved:
      getApprovedExtensionRequests(
        safeRequests
      ).length,

    rejected:
      getRejectedExtensionRequests(
        safeRequests
      ).length,
  };
};

/**
 * Check whether a request can still
 * be decided.
 */
export const canDecideExtensionRequest = (
  request
) => {
  return (
    request?.status ===
    EXTENSION_REQUEST_STATUS.PENDING
  );
};

/**
 * Normalize an extension request.
 */
export const normalizeExtensionRequest = (
  request = {}
) => {
  return {
    ...request,

    id:
      normalizeExtensionId(
        request.id
      ) ||
      generateExtensionRequestId(),

    eventId:
      normalizeExtensionId(
        request.eventId
      ),

    participantId:
      normalizeExtensionId(
        request.participantId
      ),

    submissionId:
      normalizeExtensionId(
        request.submissionId
      ),

    reason:
      normalizeExtensionText(
        request.reason
      ),

    requestedDeadline:
      normalizeExtensionText(
        request.requestedDeadline
      ),

    originalDeadline:
      normalizeExtensionText(
        request.originalDeadline
      ),

    teamInformation:
      normalizeExtensionText(
        request.teamInformation
      ),

    status:
      request.status ||
      EXTENSION_REQUEST_STATUS.PENDING,

    decisionComment:
      normalizeExtensionText(
        request.decisionComment
      ),
  };
};

/**
 * Normalize a request collection.
 */
export const normalizeExtensionRequests = (
  requests = []
) => {
  if (
    !Array.isArray(
      requests
    )
  ) {
    return [];
  }

  return requests.map(
    (request) =>
      normalizeExtensionRequest(
        request
      )
  );
};

/**
 * Sort requests by newest first.
 */
export const sortExtensionRequestsByNewest =
  (requests = []) => {
    return [
      ...(Array.isArray(
        requests
      )
        ? requests
        : []),
    ].sort(
      (a, b) => {
        const first =
          toExtensionDate(
            a.requestedAt
          )?.getTime() || 0;

        const second =
          toExtensionDate(
            b.requestedAt
          )?.getTime() || 0;

        return second - first;
      }
    );
  };

/**
 * Check whether a requested deadline
 * exceeds a maximum extension period.
 *
 * maxDays is optional.
 */
export const exceedsMaximumExtension = (
  originalDeadline,
  requestedDeadline,
  maxDays
) => {
  if (
    maxDays === undefined ||
    maxDays === null
  ) {
    return false;
  }

  const durationDays =
    getExtensionDurationDays(
      originalDeadline,
      requestedDeadline
    );

  return (
    durationDays >
    Number(maxDays)
  );
};