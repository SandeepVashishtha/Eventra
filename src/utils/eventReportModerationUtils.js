/**
 * Event Report & Moderation utilities.
 *
 * Supports:
 * - Report reasons
 * - Report validation
 * - Report creation
 * - Duplicate report detection
 * - Moderator resolution
 * - Report dismissal
 * - Moderator comments
 * - Report filtering
 * - Moderation statistics
 */

export const EVENT_REPORT_REASONS = [
  {
    id: "spam",
    label: "Spam",
    description:
      "The event contains promotional or repetitive spam content.",
  },
  {
    id: "incorrect_information",
    label: "Incorrect information",
    description:
      "The event contains inaccurate or misleading information.",
  },
  {
    id: "duplicate_event",
    label: "Duplicate event",
    description:
      "This event appears to duplicate another event listing.",
  },
  {
    id: "inappropriate_content",
    label: "Inappropriate content",
    description:
      "The event contains content that is inappropriate or violates platform guidelines.",
  },
  {
    id: "suspicious_activity",
    label: "Suspicious activity",
    description:
      "The event appears suspicious, fraudulent, or unsafe.",
  },
  {
    id: "other",
    label: "Other",
    description:
      "Report another issue that does not fit the listed categories.",
  },
];

export const EVENT_REPORT_STATUS = {
  PENDING: "pending",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
};

export const EVENT_REPORT_ACTIONS = {
  CREATED: "created",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
  COMMENTED: "commented",
};

export const DEFAULT_MAX_DETAILS_LENGTH = 2000;
export const DEFAULT_MAX_COMMENT_LENGTH = 1000;

/**
 * Normalize an identifier.
 */
export const normalizeReportId = (
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
 * Normalize text.
 */
export const normalizeReportText = (
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
 * Convert a value to a safe array.
 */
export const toReportArray = (
  value
) => {
  return Array.isArray(value)
    ? value
    : [];
};

/**
 * Generate a unique report ID.
 */
export const generateEventReportId = () => {
  return `event-report-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

/**
 * Generate a moderation decision ID.
 */
export const generateModerationDecisionId =
  () => {
    return `moderation-decision-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 9)}`;
  };

/**
 * Generate an activity record ID.
 */
export const generateReportActivityId = () => {
  return `report-activity-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
  };

/**
 * Check whether a report reason is supported.
 */
export const isValidEventReportReason = (
  reason
) => {
  const normalizedReason =
    normalizeReportText(
      reason
    );

  return EVENT_REPORT_REASONS.some(
    (item) =>
      item.id ===
      normalizedReason
  );
};

/**
 * Get a report reason configuration.
 */
export const getEventReportReason = (
  reason
) => {
  const normalizedReason =
    normalizeReportText(
      reason
    );

  return (
    EVENT_REPORT_REASONS.find(
      (item) =>
        item.id ===
        normalizedReason
    ) || null
  );
};

/**
 * Get a human-readable reason label.
 */
export const getEventReportReasonLabel = (
  reason
) => {
  return (
    getEventReportReason(
      reason
    )?.label ||
    "Other"
  );
};

/**
 * Get a report status label.
 */
export const getEventReportStatusLabel = (
  status
) => {
  const labels = {
    [EVENT_REPORT_STATUS.PENDING]:
      "Pending Review",

    [EVENT_REPORT_STATUS.RESOLVED]:
      "Resolved",

    [EVENT_REPORT_STATUS.DISMISSED]:
      "Dismissed",
  };

  return (
    labels[status] ||
    "Unknown"
  );
};

/**
 * Validate report details.
 */
export const validateReportDetails = (
  details,
  maxLength = DEFAULT_MAX_DETAILS_LENGTH
) => {
  const normalizedDetails =
    normalizeReportText(
      details
    );

  if (
    normalizedDetails.length >
    maxLength
  ) {
    return {
      valid: false,
      errors: [
        `Additional details cannot exceed ${maxLength} characters.`,
      ],
    };
  }

  return {
    valid: true,
    errors: [],
  };
};

/**
 * Validate an event report.
 */
export const validateEventReport = ({
  eventId,
  reporterId,
  reason,
  details = "",
} = {}) => {
  const errors = [];

  if (
    !normalizeReportId(
      eventId
    )
  ) {
    errors.push(
      "Event ID is required."
    );
  }

  if (
    !normalizeReportId(
      reporterId
    )
  ) {
    errors.push(
      "Reporter ID is required."
    );
  }

  if (
    !isValidEventReportReason(
      reason
    )
  ) {
    errors.push(
      "Please select a valid report reason."
    );
  }

  const detailsResult =
    validateReportDetails(
      details
    );

  errors.push(
    ...detailsResult.errors
  );

  return {
    valid:
      errors.length === 0,
    errors,
  };
};

/**
 * Create a new event report.
 */
export const createEventReport = ({
  eventId,
  reporterId,
  reason,
  details = "",
  eventTitle = "",
} = {}) => {
  const now =
    new Date().toISOString();

  return {
    id:
      generateEventReportId(),

    eventId:
      normalizeReportId(
        eventId
      ),

    eventTitle:
      normalizeReportText(
        eventTitle
      ),

    reporterId:
      normalizeReportId(
        reporterId
      ),

    reason:
      normalizeReportText(
        reason
      ),

    details:
      normalizeReportText(
        details
      ),

    status:
      EVENT_REPORT_STATUS.PENDING,

    createdAt: now,

    updatedAt: now,

    resolvedAt: null,

    resolvedBy: null,

    resolutionComment: "",

    decisionId: null,

    moderatorComments: [],
  };
};

/**
 * Find a report by ID.
 */
export const findEventReport = (
  reports = [],
  reportId
) => {
  const normalizedId =
    normalizeReportId(
      reportId
    );

  return (
    toReportArray(
      reports
    ).find(
      (report) =>
        normalizeReportId(
          report.id
        ) === normalizedId
    ) || null
  );
};

/**
 * Check whether a user already reported
 * an event.
 */
export const hasUserReportedEvent = (
  reports = [],
  eventId,
  reporterId
) => {
  const normalizedEventId =
    normalizeReportId(
      eventId
    );

  const normalizedReporterId =
    normalizeReportId(
      reporterId
    );

  return toReportArray(
    reports
  ).some(
    (report) =>
      normalizeReportId(
        report.eventId
      ) === normalizedEventId &&
      normalizeReportId(
        report.reporterId
      ) === normalizedReporterId
  );
};

/**
 * Find an existing report by event
 * and reporter.
 */
export const findUserEventReport = (
  reports = [],
  eventId,
  reporterId
) => {
  const normalizedEventId =
    normalizeReportId(
      eventId
    );

  const normalizedReporterId =
    normalizeReportId(
      reporterId
    );

  return (
    toReportArray(
      reports
    ).find(
      (report) =>
        normalizeReportId(
          report.eventId
        ) === normalizedEventId &&
        normalizeReportId(
          report.reporterId
        ) === normalizedReporterId
    ) || null
  );
};

/**
 * Add a report if it is not already present.
 */
export const addEventReport = (
  reports = [],
  report
) => {
  const safeReports =
    toReportArray(
      reports
    );

  if (!report) {
    return [...safeReports];
  }

  if (
    findEventReport(
      safeReports,
      report.id
    )
  ) {
    return [...safeReports];
  }

  return [
    ...safeReports,
    report,
  ];
};

/**
 * Resolve a report.
 */
export const resolveEventReport = (
  reports = [],
  reportId,
  moderatorId,
  resolutionComment = ""
) => {
  const normalizedReportId =
    normalizeReportId(
      reportId
    );

  const normalizedModeratorId =
    normalizeReportId(
      moderatorId
    );

  const now =
    new Date().toISOString();

  return toReportArray(
    reports
  ).map(
    (report) => {
      if (
        normalizeReportId(
          report.id
        ) !== normalizedReportId
      ) {
        return report;
      }

      return {
        ...report,

        status:
          EVENT_REPORT_STATUS.RESOLVED,

        resolvedAt: now,

        resolvedBy:
          normalizedModeratorId,

        resolutionComment:
          normalizeReportText(
            resolutionComment
          ),

        decisionId:
          generateModerationDecisionId(),

        updatedAt: now,
      };
    }
  );
};

/**
 * Dismiss a report.
 */
export const dismissEventReport = (
  reports = [],
  reportId,
  moderatorId,
  resolutionComment = ""
) => {
  const normalizedReportId =
    normalizeReportId(
      reportId
    );

  const normalizedModeratorId =
    normalizeReportId(
      moderatorId
    );

  const now =
    new Date().toISOString();

  return toReportArray(
    reports
  ).map(
    (report) => {
      if (
        normalizeReportId(
          report.id
        ) !== normalizedReportId
      ) {
        return report;
      }

      return {
        ...report,

        status:
          EVENT_REPORT_STATUS.DISMISSED,

        resolvedAt: now,

        resolvedBy:
          normalizedModeratorId,

        resolutionComment:
          normalizeReportText(
            resolutionComment
          ),

        decisionId:
          generateModerationDecisionId(),

        updatedAt: now,
      };
    }
  );
};

/**
 * Add a moderator comment.
 */
export const addModeratorComment = (
  reports = [],
  reportId,
  moderatorId,
  comment
) => {
  const normalizedReportId =
    normalizeReportId(
      reportId
    );

  const normalizedModeratorId =
    normalizeReportId(
      moderatorId
    );

  const normalizedComment =
    normalizeReportText(
      comment
    );

  if (!normalizedComment) {
    return [
      ...toReportArray(
        reports
      ),
    ];
  }

  if (
    normalizedComment.length >
    DEFAULT_MAX_COMMENT_LENGTH
  ) {
    return [
      ...toReportArray(
        reports
      ),
    ];
  }

  const now =
    new Date().toISOString();

  return toReportArray(
    reports
  ).map(
    (report) => {
      if (
        normalizeReportId(
          report.id
        ) !== normalizedReportId
      ) {
        return report;
      }

      const existingComments =
        toReportArray(
          report.moderatorComments
        );

      return {
        ...report,

        moderatorComments: [
          ...existingComments,
          {
            id:
              generateReportActivityId(),

            moderatorId:
              normalizedModeratorId,

            comment:
              normalizedComment,

            createdAt: now,
          },
        ],

        updatedAt: now,
      };
    }
  );
};

/**
 * Get pending reports.
 */
export const getPendingEventReports = (
  reports = []
) => {
  return toReportArray(
    reports
  ).filter(
    (report) =>
      report.status ===
      EVENT_REPORT_STATUS.PENDING
  );
};

/**
 * Get resolved reports.
 */
export const getResolvedEventReports = (
  reports = []
) => {
  return toReportArray(
    reports
  ).filter(
    (report) =>
      report.status ===
      EVENT_REPORT_STATUS.RESOLVED
  );
};

/**
 * Get dismissed reports.
 */
export const getDismissedEventReports = (
  reports = []
) => {
  return toReportArray(
    reports
  ).filter(
    (report) =>
      report.status ===
      EVENT_REPORT_STATUS.DISMISSED
  );
};

/**
 * Get reports for an event.
 */
export const getEventReports = (
  reports = [],
  eventId
) => {
  const normalizedEventId =
    normalizeReportId(
      eventId
    );

  return toReportArray(
    reports
  ).filter(
    (report) =>
      normalizeReportId(
        report.eventId
      ) === normalizedEventId
  );
};

/**
 * Get reports created by a user.
 */
export const getReporterReports = (
  reports = [],
  reporterId
) => {
  const normalizedReporterId =
    normalizeReportId(
      reporterId
    );

  return toReportArray(
    reports
  ).filter(
    (report) =>
      normalizeReportId(
        report.reporterId
      ) === normalizedReporterId
  );
};

/**
 * Get reports assigned to a moderator.
 */
export const getModeratorResolvedReports = (
  reports = [],
  moderatorId
) => {
  const normalizedModeratorId =
    normalizeReportId(
      moderatorId
    );

  return toReportArray(
    reports
  ).filter(
    (report) =>
      normalizeReportId(
        report.resolvedBy
      ) === normalizedModeratorId
  );
};

/**
 * Filter reports by reason.
 */
export const filterReportsByReason = (
  reports = [],
  reason
) => {
  const normalizedReason =
    normalizeReportText(
      reason
    );

  return toReportArray(
    reports
  ).filter(
    (report) =>
      normalizeReportText(
        report.reason
      ) === normalizedReason
  );
};

/**
 * Filter reports by status.
 */
export const filterReportsByStatus = (
  reports = [],
  status
) => {
  return toReportArray(
    reports
  ).filter(
    (report) =>
      report.status === status
  );
};

/**
 * Get report statistics.
 */
export const getEventReportStatistics = (
  reports = []
) => {
  const safeReports =
    toReportArray(
      reports
    );

  return {
    total:
      safeReports.length,

    pending:
      getPendingEventReports(
        safeReports
      ).length,

    resolved:
      getResolvedEventReports(
        safeReports
      ).length,

    dismissed:
      getDismissedEventReports(
        safeReports
      ).length,
  };
};

/**
 * Get statistics grouped by reason.
 */
export const getReportReasonStatistics = (
  reports = []
) => {
  const statistics = {};

  EVENT_REPORT_REASONS.forEach(
    (reason) => {
      statistics[reason.id] = 0;
    }
  );

  toReportArray(
    reports
  ).forEach(
    (report) => {
      if (
        Object.prototype.hasOwnProperty.call(
          statistics,
          report.reason
        )
      ) {
        statistics[
          report.reason
        ] += 1;
      }
    }
  );

  return statistics;
};

/**
 * Get the most frequently reported reason.
 */
export const getMostReportedReason = (
  reports = []
) => {
  const statistics =
    getReportReasonStatistics(
      reports
    );

  let highestReason = null;
  let highestCount = 0;

  Object.entries(
    statistics
  ).forEach(
    ([reason, count]) => {
      if (
        count >
        highestCount
      ) {
        highestReason =
          reason;
        highestCount =
          count;
      }
    }
  );

  if (!highestReason) {
    return null;
  }

  return {
    reason: highestReason,
    label:
      getEventReportReasonLabel(
        highestReason
      ),
    count:
      highestCount,
  };
};

/**
 * Sort reports by newest first.
 */
export const sortReportsByNewest = (
  reports = []
) => {
  return [
    ...toReportArray(
      reports
    ),
  ].sort(
    (a, b) => {
      const first =
        new Date(
          a.createdAt || 0
        ).getTime();

      const second =
        new Date(
          b.createdAt || 0
        ).getTime();

      return second - first;
    }
  );
};

/**
 * Sort reports by oldest first.
 */
export const sortReportsByOldest = (
  reports = []
) => {
  return [
    ...toReportArray(
      reports
    ),
  ].sort(
    (a, b) => {
      const first =
        new Date(
          a.createdAt || 0
        ).getTime();

      const second =
        new Date(
          b.createdAt || 0
        ).getTime();

      return first - second;
    }
  );
};

/**
 * Check whether a report can be moderated.
 */
export const canModerateEventReport = (
  report
) => {
  return (
    report?.status ===
    EVENT_REPORT_STATUS.PENDING
  );
};

/**
 * Check whether a report is closed.
 */
export const isEventReportClosed = (
  report
) => {
  return (
    report?.status ===
      EVENT_REPORT_STATUS.RESOLVED ||
    report?.status ===
      EVENT_REPORT_STATUS.DISMISSED
  );
};

/**
 * Normalize a report.
 */
export const normalizeEventReport = (
  report = {}
) => {
  return {
    ...report,

    id:
      normalizeReportId(
        report.id
      ) ||
      generateEventReportId(),

    eventId:
      normalizeReportId(
        report.eventId
      ),

    eventTitle:
      normalizeReportText(
        report.eventTitle
      ),

    reporterId:
      normalizeReportId(
        report.reporterId
      ),

    reason:
      normalizeReportText(
        report.reason
      ),

    details:
      normalizeReportText(
        report.details
      ),

    status:
      report.status ||
      EVENT_REPORT_STATUS.PENDING,

    resolutionComment:
      normalizeReportText(
        report.resolutionComment
      ),

    moderatorComments:
      toReportArray(
        report.moderatorComments
      ),
  };
};

/**
 * Normalize a collection of reports.
 */
export const normalizeEventReports = (
  reports = []
) => {
  return toReportArray(
    reports
  ).map(
    (report) =>
      normalizeEventReport(
        report
      )
  );
};

/**
 * Create a moderation activity record.
 */
export const createReportActivity = ({
  reportId,
  eventId,
  actorId,
  action,
  details = "",
} = {}) => {
  return {
    id:
      generateReportActivityId(),

    reportId:
      normalizeReportId(
        reportId
      ),

    eventId:
      normalizeReportId(
        eventId
      ),

    actorId:
      normalizeReportId(
        actorId
      ),

    action:
      normalizeReportText(
        action
      ),

    details:
      normalizeReportText(
        details
      ),

    timestamp:
      new Date().toISOString(),
  };
};

/**
 * Get a human-readable action label.
 */
export const getReportActionLabel = (
  action
) => {
  const labels = {
    [EVENT_REPORT_ACTIONS.CREATED]:
      "Report submitted",

    [EVENT_REPORT_ACTIONS.RESOLVED]:
      "Report resolved",

    [EVENT_REPORT_ACTIONS.DISMISSED]:
      "Report dismissed",

    [EVENT_REPORT_ACTIONS.COMMENTED]:
      "Moderator commented",
  };

  return (
    labels[action] ||
    "Report updated"
  );
};

/**
 * Calculate resolution percentage.
 */
export const getReportResolutionRate = (
  reports = []
) => {
  const statistics =
    getEventReportStatistics(
      reports
    );

  if (
    statistics.total === 0
  ) {
    return 0;
  }

  return Math.round(
    ((statistics.resolved +
      statistics.dismissed) /
      statistics.total) *
      100
  );
};

/**
 * Get complete moderation dashboard
 * statistics.
 */
export const getModerationDashboardStatistics =
  (
    reports = []
  ) => {
    const statistics =
      getEventReportStatistics(
        reports
      );

    return {
      ...statistics,

      resolutionRate:
        getReportResolutionRate(
          reports
        ),

      reasonBreakdown:
        getReportReasonStatistics(
          reports
        ),

      mostReportedReason:
        getMostReportedReason(
          reports
        ),
    };
  };