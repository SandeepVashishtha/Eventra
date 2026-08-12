/**
 * Participant Search & Filter utilities.
 *
 * Supports:
 * - Name search
 * - Email search
 * - Registration status
 * - Team filtering
 * - Attendance status
 * - Registration date filtering
 * - Participant category filtering
 * - Combined filters
 * - Sorting
 */

export const DEFAULT_PARTICIPANT_FILTERS = {
  search: "",
  registrationStatus: "",
  team: "",
  attendanceStatus: "",
  registrationDate: "",
  participantCategory: "",
};

/**
 * Normalize text for comparisons.
 */
export const normalizeParticipantValue = (
  value
) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
};

/**
 * Normalize participant filters.
 */
export const normalizeParticipantFilters = (
  filters = {}
) => {
  return {
    ...DEFAULT_PARTICIPANT_FILTERS,
    ...filters,
  };
};

/**
 * Get participant display name.
 */
export const getParticipantDisplayName = (
  participant = {}
) => {
  if (participant.name) {
    return participant.name;
  }

  const fullName = [
    participant.firstName,
    participant.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    participant.fullName ||
    participant.username ||
    "Unknown Participant"
  );
};

/**
 * Get participant email.
 */
export const getParticipantEmail = (
  participant = {}
) => {
  return (
    participant.email ||
    participant.emailAddress ||
    participant.user?.email ||
    ""
  );
};

/**
 * Get registration status.
 */
export const getParticipantRegistrationStatus =
  (participant = {}) => {
    return normalizeParticipantValue(
      participant.registrationStatus ||
        participant.status ||
        participant.registration?.status
    );
  };

/**
 * Get participant team.
 */
export const getParticipantTeam = (
  participant = {}
) => {
  const team =
    participant.team ||
    participant.teamName ||
    participant.teamId ||
    participant.registration?.team;

  if (
    team &&
    typeof team === "object"
  ) {
    return (
      team.id ||
      team.name ||
      team.title ||
      ""
    );
  }

  return team || "";
};

/**
 * Get participant team name.
 */
export const getParticipantTeamName = (
  participant = {}
) => {
  const team =
    participant.team;

  if (
    team &&
    typeof team === "object"
  ) {
    return (
      team.name ||
      team.title ||
      team.id ||
      "No team"
    );
  }

  return (
    participant.teamName ||
    team ||
    "No team"
  );
};

/**
 * Get attendance status.
 */
export const getParticipantAttendanceStatus =
  (participant = {}) => {
    const value =
      participant.attendanceStatus ||
      participant.attendance ||
      participant.attendance?.status;

    if (
      value === true
    ) {
      return "attended";
    }

    if (
      value === false
    ) {
      return "absent";
    }

    return normalizeParticipantValue(
      value || "not-marked"
    );
  };

/**
 * Get registration date.
 */
export const getParticipantRegistrationDate =
  (participant = {}) => {
    return (
      participant.registrationDate ||
      participant.registeredAt ||
      participant.registration?.createdAt ||
      participant.createdAt ||
      null
    );
  };

/**
 * Get participant category.
 */
export const getParticipantCategory =
  (participant = {}) => {
    return (
      participant.participantCategory ||
      participant.category ||
      participant.registrationCategory ||
      participant.type ||
      ""
    );
  };

/**
 * Search by participant name or email.
 */
export const searchParticipants = (
  participants = [],
  search = ""
) => {
  if (
    !Array.isArray(participants)
  ) {
    return [];
  }

  const query =
    normalizeParticipantValue(
      search
    );

  if (!query) {
    return [...participants];
  }

  return participants.filter(
    (participant) => {
      const name =
        normalizeParticipantValue(
          getParticipantDisplayName(
            participant
          )
        );

      const email =
        normalizeParticipantValue(
          getParticipantEmail(
            participant
          )
        );

      return (
        name.includes(query) ||
        email.includes(query)
      );
    }
  );
};

/**
 * Match registration status.
 */
export const matchesRegistrationStatus =
  (
    participant,
    status
  ) => {
    if (!status) {
      return true;
    }

    return (
      getParticipantRegistrationStatus(
        participant
      ) ===
      normalizeParticipantValue(
        status
      )
    );
  };

/**
 * Match team.
 */
export const matchesTeam = (
  participant,
  team
) => {
  if (!team) {
    return true;
  }

  const participantTeam =
    normalizeParticipantValue(
      getParticipantTeam(
        participant
      )
    );

  const requestedTeam =
    normalizeParticipantValue(
      team
    );

  return (
    participantTeam ===
      requestedTeam ||
    participantTeam.includes(
      requestedTeam
    ) ||
    requestedTeam.includes(
      participantTeam
    )
  );
};

/**
 * Match attendance status.
 */
export const matchesAttendanceStatus =
  (
    participant,
    status
  ) => {
    if (!status) {
      return true;
    }

    return (
      getParticipantAttendanceStatus(
        participant
      ) ===
      normalizeParticipantValue(
        status
      )
    );
  };

/**
 * Match participant category.
 */
export const matchesParticipantCategory =
  (
    participant,
    category
  ) => {
    if (!category) {
      return true;
    }

    const participantCategory =
      normalizeParticipantValue(
        getParticipantCategory(
          participant
        )
      );

    const requestedCategory =
      normalizeParticipantValue(
        category
      );

    return (
      participantCategory ===
        requestedCategory ||
      participantCategory.includes(
        requestedCategory
      ) ||
      requestedCategory.includes(
        participantCategory
      )
    );
  };

/**
 * Convert date to a valid Date.
 */
export const parseParticipantDate = (
  value
) => {
  if (!value) {
    return null;
  }

  const date =
    value instanceof Date
      ? new Date(value)
      : new Date(value);

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
 * Get the beginning of today.
 */
export const getStartOfDay = (
  date = new Date()
) => {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
};

/**
 * Get the beginning of a date
 * offset by a number of days.
 */
export const getDaysAgo = (
  days,
  fromDate = new Date()
) => {
  const result =
    getStartOfDay(
      fromDate
    );

  result.setDate(
    result.getDate() -
      Number(days)
  );

  return result;
};

/**
 * Match registration date filters.
 *
 * Supported:
 * - today
 * - last-7-days
 * - last-30-days
 * - last-90-days
 */
export const matchesRegistrationDate = (
  participant,
  dateFilter,
  now = new Date()
) => {
  if (!dateFilter) {
    return true;
  }

  const registrationDate =
    parseParticipantDate(
      getParticipantRegistrationDate(
        participant
      )
    );

  if (!registrationDate) {
    return false;
  }

  const today =
    getStartOfDay(now);

  if (
    dateFilter === "today"
  ) {
    const nextDay =
      new Date(today);

    nextDay.setDate(
      nextDay.getDate() + 1
    );

    return (
      registrationDate >=
        today &&
      registrationDate <
        nextDay
    );
  }

  const daysMap = {
    "last-7-days": 7,
    "last-30-days": 30,
    "last-90-days": 90,
  };

  const days =
    daysMap[dateFilter];

  if (!days) {
    return true;
  }

  const startDate =
    getDaysAgo(
      days,
      now
    );

  return (
    registrationDate >=
    startDate
  );
};

/**
 * Check whether one participant matches
 * all supplied filters.
 */
export const participantMatchesFilters = (
  participant,
  filters = {},
  options = {}
) => {
  const normalized =
    normalizeParticipantFilters(
      filters
    );

  const now =
    options.now || new Date();

  const searchMatches =
    !normalized.search ||
    searchParticipants(
      [participant],
      normalized.search
    ).length > 0;

  if (!searchMatches) {
    return false;
  }

  if (
    !matchesRegistrationStatus(
      participant,
      normalized.registrationStatus
    )
  ) {
    return false;
  }

  if (
    !matchesTeam(
      participant,
      normalized.team
    )
  ) {
    return false;
  }

  if (
    !matchesAttendanceStatus(
      participant,
      normalized.attendanceStatus
    )
  ) {
    return false;
  }

  if (
    !matchesRegistrationDate(
      participant,
      normalized.registrationDate,
      now
    )
  ) {
    return false;
  }

  if (
    !matchesParticipantCategory(
      participant,
      normalized.participantCategory
    )
  ) {
    return false;
  }

  return true;
};

/**
 * Filter participants using all filters.
 */
export const filterParticipants = (
  participants = [],
  filters = {},
  options = {}
) => {
  if (
    !Array.isArray(
      participants
    )
  ) {
    return [];
  }

  return participants.filter(
    (participant) =>
      participantMatchesFilters(
        participant,
        filters,
        options
      )
  );
};

/**
 * Get count after filtering.
 */
export const getFilteredParticipantCount =
  (
    participants = [],
    filters = {},
    options = {}
  ) => {
    return filterParticipants(
      participants,
      filters,
      options
    ).length;
  };

/**
 * Check if any filters are active.
 */
export const hasActiveParticipantFilters = (
  filters = {}
) => {
  const normalized =
    normalizeParticipantFilters(
      filters
    );

  return Object.values(
    normalized
  ).some(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  );
};

/**
 * Clear all filters.
 */
export const clearParticipantFilters =
  () => ({
    ...DEFAULT_PARTICIPANT_FILTERS,
  });

/**
 * Sort participants by name.
 */
export const sortParticipantsByName = (
  participants = [],
  direction = "asc"
) => {
  return [
    ...(Array.isArray(
      participants
    )
      ? participants
      : []),
  ].sort(
    (first, second) => {
      const firstName =
        getParticipantDisplayName(
          first
        ).toLowerCase();

      const secondName =
        getParticipantDisplayName(
          second
        ).toLowerCase();

      const result =
        firstName.localeCompare(
          secondName
        );

      return direction ===
        "desc"
        ? -result
        : result;
    }
  );
};

/**
 * Sort participants by registration date.
 */
export const sortParticipantsByRegistrationDate =
  (
    participants = [],
    direction = "desc"
  ) => {
    return [
      ...(Array.isArray(
        participants
      )
        ? participants
        : []),
    ].sort(
      (first, second) => {
        const firstDate =
          parseParticipantDate(
            getParticipantRegistrationDate(
              first
            )
          );

        const secondDate =
          parseParticipantDate(
            getParticipantRegistrationDate(
              second
            )
          );

        if (!firstDate) {
          return 1;
        }

        if (!secondDate) {
          return -1;
        }

        const result =
          firstDate.getTime() -
          secondDate.getTime();

        return direction ===
          "desc"
          ? -result
          : result;
      }
    );
  };

/**
 * Get unique teams from participants.
 */
export const getUniqueParticipantTeams = (
  participants = []
) => {
  if (
    !Array.isArray(
      participants
    )
  ) {
    return [];
  }

  const teams = new Map();

  participants.forEach(
    (participant) => {
      const team =
        getParticipantTeam(
          participant
        );

      if (!team) {
        return;
      }

      const key =
        normalizeParticipantValue(
          team
        );

      if (!teams.has(key)) {
        teams.set(
          key,
          {
            id: team,
            name: getParticipantTeamName(
              participant
            ),
          }
        );
      }
    }
  );

  return Array.from(
    teams.values()
  );
};

/**
 * Get unique participant categories.
 */
export const getUniqueParticipantCategories =
  (
    participants = []
  ) => {
    if (
      !Array.isArray(
        participants
      )
    ) {
      return [];
    }

    const categories =
      new Map();

    participants.forEach(
      (participant) => {
        const category =
          getParticipantCategory(
            participant
          );

        if (!category) {
          return;
        }

        const key =
          normalizeParticipantValue(
            category
          );

        if (
          !categories.has(key)
        ) {
          categories.set(
            key,
            category
          );
        }
      }
    );

    return Array.from(
      categories.values()
    );
  };

/**
 * Get participant statistics.
 */
export const getParticipantFilterStats = (
  participants = [],
  filters = {}
) => {
  const filtered =
    filterParticipants(
      participants,
      filters
    );

  return {
    total: Array.isArray(
      participants
    )
      ? participants.length
      : 0,

    filtered:
      filtered.length,

    registered:
      filtered.filter(
        (participant) =>
          getParticipantRegistrationStatus(
            participant
          ) === "registered"
      ).length,

    pending:
      filtered.filter(
        (participant) =>
          getParticipantRegistrationStatus(
            participant
          ) === "pending"
      ).length,

    attended:
      filtered.filter(
        (participant) =>
          getParticipantAttendanceStatus(
            participant
          ) === "attended"
      ).length,

    absent:
      filtered.filter(
        (participant) =>
          getParticipantAttendanceStatus(
            participant
          ) === "absent"
      ).length,
  };
};

/**
 * Search and filter participants in one call.
 */
export const searchAndFilterParticipants = (
  participants = [],
  filters = {},
  options = {}
) => {
  const filtered =
    filterParticipants(
      participants,
      filters,
      options
    );

  const sortBy =
    options.sortBy || "";

  const sortDirection =
    options.sortDirection ||
    "asc";

  if (
    sortBy === "name"
  ) {
    return sortParticipantsByName(
      filtered,
      sortDirection
    );
  }

  if (
    sortBy ===
    "registrationDate"
  ) {
    return sortParticipantsByRegistrationDate(
      filtered,
      sortDirection
    );
  }

  return filtered;
};