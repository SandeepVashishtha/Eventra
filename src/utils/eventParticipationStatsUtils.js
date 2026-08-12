/**
 * Event Participation Statistics utilities.
 *
 * Supports:
 * - Events registered
 * - Events attended
 * - Hackathons joined
 * - Workshops attended
 * - Certificates earned
 * - Teams joined
 * - Participation percentages
 * - Activity normalization
 * - Statistics summaries
 */

export const PARTICIPATION_STAT_TYPES = {
  EVENTS_REGISTERED: "eventsRegistered",
  EVENTS_ATTENDED: "eventsAttended",
  HACKATHONS_JOINED: "hackathonsJoined",
  WORKSHOPS_ATTENDED: "workshopsAttended",
  CERTIFICATES_EARNED: "certificatesEarned",
  TEAMS_JOINED: "teamsJoined",
};

export const PARTICIPATION_STAT_CONFIG = [
  {
    id: PARTICIPATION_STAT_TYPES.EVENTS_REGISTERED,
    label: "Events Registered",
    description:
      "Total events the user has registered for.",
  },
  {
    id: PARTICIPATION_STAT_TYPES.EVENTS_ATTENDED,
    label: "Events Attended",
    description:
      "Total registered events the user attended.",
  },
  {
    id: PARTICIPATION_STAT_TYPES.HACKATHONS_JOINED,
    label: "Hackathons Joined",
    description:
      "Total hackathons the user participated in.",
  },
  {
    id: PARTICIPATION_STAT_TYPES.WORKSHOPS_ATTENDED,
    label: "Workshops Attended",
    description:
      "Total workshops the user attended.",
  },
  {
    id: PARTICIPATION_STAT_TYPES.CERTIFICATES_EARNED,
    label: "Certificates Earned",
    description:
      "Total certificates earned by the user.",
  },
  {
    id: PARTICIPATION_STAT_TYPES.TEAMS_JOINED,
    label: "Teams Joined",
    description:
      "Total event or hackathon teams joined.",
  },
];

/**
 * Safely convert a value to an array.
 */
export const toArray = (
  value
) => {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
};

/**
 * Safely convert a value to a number.
 */
export const toNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  if (
    Number.isFinite(number)
  ) {
    return number;
  }

  return fallback;
};

/**
 * Normalize an identifier.
 */
export const normalizeParticipationId = (
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
 * Get an ID from an object.
 */
export const getParticipationId = (
  item
) => {
  if (
    item === null ||
    item === undefined
  ) {
    return "";
  }

  if (
    typeof item !==
    "object"
  ) {
    return normalizeParticipationId(
      item
    );
  }

  return normalizeParticipationId(
    item.id ??
      item.eventId ??
      item.event_id ??
      item.registrationId ??
      item.registration_id
  );
};

/**
 * Get a user's event registrations.
 */
export const getEventRegistrations = (
  user = {}
) => {
  return toArray(
    user.eventRegistrations ??
      user.eventRegistrationsList ??
      user.registrations ??
      user.registeredEvents
  );
};

/**
 * Get attended events.
 */
export const getAttendedEvents = (
  user = {}
) => {
  return toArray(
    user.attendedEvents ??
      user.eventsAttended ??
      user.attendance
  );
};

/**
 * Get joined hackathons.
 */
export const getJoinedHackathons = (
  user = {}
) => {
  return toArray(
    user.hackathonsJoined ??
      user.joinedHackathons ??
      user.hackathons
  );
};

/**
 * Get attended workshops.
 */
export const getAttendedWorkshops = (
  user = {}
) => {
  return toArray(
    user.workshopsAttended ??
      user.attendedWorkshops ??
      user.workshops
  );
};

/**
 * Get earned certificates.
 */
export const getEarnedCertificates = (
  user = {}
) => {
  return toArray(
    user.certificatesEarned ??
      user.certificates ??
      user.earnedCertificates
  );
};

/**
 * Get joined teams.
 */
export const getJoinedTeams = (
  user = {}
) => {
  return toArray(
    user.teamsJoined ??
      user.joinedTeams ??
      user.teams
  );
};

/**
 * Remove duplicate items by ID.
 */
export const uniqueParticipationItems = (
  items = []
) => {
  const seen = new Set();

  return toArray(items).filter(
    (item) => {
      const id =
        getParticipationId(
          item
        );

      if (!id) {
        return true;
      }

      if (seen.has(id)) {
        return false;
      }

      seen.add(id);

      return true;
    }
  );
};

/**
 * Count unique participation items.
 */
export const countUniqueParticipationItems = (
  items = []
) => {
  return uniqueParticipationItems(
    items
  ).length;
};

/**
 * Calculate attendance percentage.
 */
export const calculateAttendancePercentage = ({
  registered = 0,
  attended = 0,
} = {}) => {
  const registeredCount =
    toNumber(
      registered
    );

  const attendedCount =
    toNumber(
      attended
    );

  if (
    registeredCount <= 0
  ) {
    return 0;
  }

  const percentage =
    (attendedCount /
      registeredCount) *
    100;

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        percentage
      )
    )
  );
};

/**
 * Calculate participation percentage.
 */
export const calculateParticipationPercentage =
  ({
    completed = 0,
    total = 0,
  } = {}) => {
    const completedCount =
      toNumber(
        completed
      );

    const totalCount =
      toNumber(total);

    if (totalCount <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Math.round(
          (completedCount /
            totalCount) *
            100
        )
      )
    );
  };

/**
 * Get events registered count.
 */
export const getEventsRegisteredCount = (
  user = {}
) => {
  if (
    user.eventsRegistered !==
    undefined
  ) {
    return Math.max(
      0,
      toNumber(
        user.eventsRegistered
      )
    );
  }

  return countUniqueParticipationItems(
    getEventRegistrations(
      user
    )
  );
};

/**
 * Get events attended count.
 */
export const getEventsAttendedCount = (
  user = {}
) => {
  if (
    user.eventsAttended !==
    undefined &&
    typeof user.eventsAttended !==
      "object"
  ) {
    return Math.max(
      0,
      toNumber(
        user.eventsAttended
      )
    );
  }

  return countUniqueParticipationItems(
    getAttendedEvents(
      user
    )
  );
};

/**
 * Get hackathons joined count.
 */
export const getHackathonsJoinedCount = (
  user = {}
) => {
  if (
    user.hackathonsJoinedCount !==
    undefined
  ) {
    return Math.max(
      0,
      toNumber(
        user.hackathonsJoinedCount
      )
    );
  }

  if (
    user.hackathonsJoined !==
      undefined &&
    typeof user.hackathonsJoined !==
      "object"
  ) {
    return Math.max(
      0,
      toNumber(
        user.hackathonsJoined
      )
    );
  }

  return countUniqueParticipationItems(
    getJoinedHackathons(
      user
    )
  );
};

/**
 * Get workshops attended count.
 */
export const getWorkshopsAttendedCount = (
  user = {}
) => {
  if (
    user.workshopsAttendedCount !==
    undefined
  ) {
    return Math.max(
      0,
      toNumber(
        user.workshopsAttendedCount
      )
    );
  }

  if (
    user.workshopsAttended !==
      undefined &&
    typeof user.workshopsAttended !==
      "object"
  ) {
    return Math.max(
      0,
      toNumber(
        user.workshopsAttended
      )
    );
  }

  return countUniqueParticipationItems(
    getAttendedWorkshops(
      user
    )
  );
};

/**
 * Get certificates earned count.
 */
export const getCertificatesEarnedCount = (
  user = {}
) => {
  if (
    user.certificatesEarnedCount !==
    undefined
  ) {
    return Math.max(
      0,
      toNumber(
        user.certificatesEarnedCount
      )
    );
  }

  if (
    user.certificatesEarned !==
      undefined &&
    typeof user.certificatesEarned !==
      "object"
  ) {
    return Math.max(
      0,
      toNumber(
        user.certificatesEarned
      )
    );
  }

  return countUniqueParticipationItems(
    getEarnedCertificates(
      user
    )
  );
};

/**
 * Get teams joined count.
 */
export const getTeamsJoinedCount = (
  user = {}
) => {
  if (
    user.teamsJoinedCount !==
    undefined
  ) {
    return Math.max(
      0,
      toNumber(
        user.teamsJoinedCount
      )
    );
  }

  if (
    user.teamsJoined !==
      undefined &&
    typeof user.teamsJoined !==
      "object"
  ) {
    return Math.max(
      0,
      toNumber(
        user.teamsJoined
      )
    );
  }

  return countUniqueParticipationItems(
    getJoinedTeams(
      user
    )
  );
};

/**
 * Build the complete participation
 * statistics object.
 */
export const getEventParticipationStatistics = (
  user = {}
) => {
  const eventsRegistered =
    getEventsRegisteredCount(
      user
    );

  const eventsAttended =
    getEventsAttendedCount(
      user
    );

  const hackathonsJoined =
    getHackathonsJoinedCount(
      user
    );

  const workshopsAttended =
    getWorkshopsAttendedCount(
      user
    );

  const certificatesEarned =
    getCertificatesEarnedCount(
      user
    );

  const teamsJoined =
    getTeamsJoinedCount(
      user
    );

  return {
    eventsRegistered,
    eventsAttended,
    hackathonsJoined,
    workshopsAttended,
    certificatesEarned,
    teamsJoined,

    attendancePercentage:
      calculateAttendancePercentage({
        registered:
          eventsRegistered,
        attended:
          eventsAttended,
      }),
  };
};

/**
 * Convert statistics into UI cards.
 */
export const getParticipationStatCards = (
  user = {}
) => {
  const statistics =
    getEventParticipationStatistics(
      user
    );

  return PARTICIPATION_STAT_CONFIG.map(
    (config) => ({
      ...config,
      value:
        statistics[
          config.id
        ] ?? 0,
    })
  );
};

/**
 * Get one statistic by type.
 */
export const getParticipationStat = (
  user = {},
  statType
) => {
  const statistics =
    getEventParticipationStatistics(
      user
    );

  return toNumber(
    statistics[
      statType
    ]
  );
};

/**
 * Check whether a statistic type
 * is supported.
 */
export const isValidParticipationStatType =
  (statType) => {
    return Object.values(
      PARTICIPATION_STAT_TYPES
    ).includes(statType);
  };

/**
 * Get configuration for a statistic.
 */
export const getParticipationStatConfig = (
  statType
) => {
  return (
    PARTICIPATION_STAT_CONFIG.find(
      (config) =>
        config.id === statType
    ) || null
  );
};

/**
 * Calculate overall participation score.
 *
 * This is an activity indicator, not a
 * percentage of all Eventra users.
 */
export const calculateParticipationScore = (
  user = {}
) => {
  const statistics =
    getEventParticipationStatistics(
      user
    );

  const score =
    statistics.eventsRegistered +
    statistics.eventsAttended * 2 +
    statistics.hackathonsJoined * 3 +
    statistics.workshopsAttended * 2 +
    statistics.certificatesEarned * 3 +
    statistics.teamsJoined;

  return Math.max(
    0,
    score
  );
};

/**
 * Get a simple activity level based
 * on participation score.
 */
export const getParticipationActivityLevel = (
  user = {}
) => {
  const score =
    calculateParticipationScore(
      user
    );

  if (score >= 50) {
    return "high";
  }

  if (score >= 20) {
    return "medium";
  }

  if (score > 0) {
    return "low";
  }

  return "none";
};

/**
 * Get a human-readable activity label.
 */
export const getParticipationActivityLabel = (
  user = {}
) => {
  const level =
    getParticipationActivityLevel(
      user
    );

  const labels = {
    high: "Highly Active",
    medium: "Active",
    low: "Getting Started",
    none: "No Activity Yet",
  };

  return (
    labels[level] ||
    "No Activity Yet"
  );
};

/**
 * Get a complete profile activity
 * summary.
 */
export const getParticipationSummary = (
  user = {}
) => {
  const statistics =
    getEventParticipationStatistics(
      user
    );

  return {
    ...statistics,

    score:
      calculateParticipationScore(
        user
      ),

    activityLevel:
      getParticipationActivityLevel(
        user
      ),

    activityLabel:
      getParticipationActivityLabel(
        user
      ),
  };
};

/**
 * Normalize profile statistics.
 */
export const normalizeParticipationStatistics =
  (
    statistics = {}
  ) => {
    return {
      eventsRegistered:
        Math.max(
          0,
          toNumber(
            statistics.eventsRegistered
          )
        ),

      eventsAttended:
        Math.max(
          0,
          toNumber(
            statistics.eventsAttended
          )
        ),

      hackathonsJoined:
        Math.max(
          0,
          toNumber(
            statistics.hackathonsJoined
          )
        ),

      workshopsAttended:
        Math.max(
          0,
          toNumber(
            statistics.workshopsAttended
          )
        ),

      certificatesEarned:
        Math.max(
          0,
          toNumber(
            statistics.certificatesEarned
          )
        ),

      teamsJoined:
        Math.max(
          0,
          toNumber(
            statistics.teamsJoined
          )
        ),
    };
  };

/**
 * Merge calculated statistics with
 * externally supplied values.
 */
export const mergeParticipationStatistics =
  (
    calculated = {},
    overrides = {}
  ) => {
    return {
      ...normalizeParticipationStatistics(
        calculated
      ),
      ...normalizeParticipationStatistics(
        overrides
      ),
    };
  };

/**
 * Get attendance status.
 */
export const getAttendanceStatus = (
  registered,
  attended
) => {
  const percentage =
    calculateAttendancePercentage({
      registered,
      attended,
    });

  if (registered <= 0) {
    return "not-started";
  }

  if (percentage >= 80) {
    return "excellent";
  }

  if (percentage >= 60) {
    return "good";
  }

  if (percentage > 0) {
    return "needs-improvement";
  }

  return "not-attended";
};

/**
 * Get attendance status label.
 */
export const getAttendanceStatusLabel = (
  registered,
  attended
) => {
  const status =
    getAttendanceStatus(
      registered,
      attended
    );

  const labels = {
    "not-started":
      "No registrations",
    excellent:
      "Excellent attendance",
    good:
      "Good attendance",
    "needs-improvement":
      "Needs improvement",
    "not-attended":
      "No attendance recorded",
  };

  return (
    labels[status] ||
    "No attendance recorded"
  );
};

/**
 * Calculate progress toward a target.
 */
export const calculateStatProgress = (
  value,
  target
) => {
  const current =
    toNumber(value);

  const targetValue =
    toNumber(target);

  if (
    targetValue <= 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        (current /
          targetValue) *
          100
      )
    )
  );
};

/**
 * Get event registration to attendance
 * conversion percentage.
 */
export const getAttendanceConversionRate = (
  user = {}
) => {
  return calculateAttendancePercentage(
    {
      registered:
        getEventsRegisteredCount(
          user
        ),
      attended:
        getEventsAttendedCount(
          user
        ),
    }
  );
};

/**
 * Check if the user has any
 * participation activity.
 */
export const hasParticipationActivity = (
  user = {}
) => {
  const statistics =
    getEventParticipationStatistics(
      user
    );

  return Object.values(
    statistics
  ).some(
    (value) =>
      typeof value ===
        "number" &&
      value > 0
  );
};

/**
 * Get statistics that have a
 * non-zero value.
 */
export const getActiveParticipationStats = (
  user = {}
) => {
  return getParticipationStatCards(
    user
  ).filter(
    (stat) =>
      toNumber(
        stat.value
      ) > 0
  );
};

/**
 * Get statistics with zero values.
 */
export const getEmptyParticipationStats = (
  user = {}
) => {
  return getParticipationStatCards(
    user
  ).filter(
    (stat) =>
      toNumber(
        stat.value
      ) === 0
  );
};

/**
 * Get a concise participation overview.
 */
export const getParticipationOverview = (
  user = {}
) => {
  const statistics =
    getEventParticipationStatistics(
      user
    );

  return {
    registered:
      statistics.eventsRegistered,

    attended:
      statistics.eventsAttended,

    hackathons:
      statistics.hackathonsJoined,

    workshops:
      statistics.workshopsAttended,

    certificates:
      statistics.certificatesEarned,

    teams:
      statistics.teamsJoined,

    attendanceRate:
      statistics.attendancePercentage,
  };
};