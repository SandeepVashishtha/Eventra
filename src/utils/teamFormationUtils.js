export const DEFAULT_MAX_TEAM_SIZE = 4;

/**
 * Create a new team.
 */
export const createTeam = ({
  name = "",
  requiredRoles = [],
  createdBy = null,
  maxTeamSize = DEFAULT_MAX_TEAM_SIZE,
} = {}) => {
  return {
    id: generateTeamId(),
    name: name.trim(),
    createdBy,
    maxTeamSize,
    requiredRoles: normalizeRoles(
      requiredRoles
    ),
    members: [],
    requests: [],
    createdAt: new Date().toISOString(),
  };
};

/**
 * Normalize team roles.
 */
export const normalizeRoles = (
  roles = []
) => {
  if (!Array.isArray(roles)) {
    return [];
  }

  const normalized = new Map();

  roles
    .map((role) => String(role).trim())
    .filter(Boolean)
    .forEach((role) => {
      const key = role.toLowerCase();

      if (!normalized.has(key)) {
        normalized.set(key, role);
      }
    });

  return Array.from(
    normalized.values()
  );
};

/**
 * Get roles required by a team.
 */
export const getTeamRoles = (
  team
) => {
  if (!team) {
    return [];
  }

  return normalizeRoles(
    team.requiredRoles || []
  );
};

/**
 * Normalize participant skills.
 */
export const getParticipantSkills = (
  participant = {}
) => {
  const skills =
    participant.skills ||
    participant.skillSet ||
    participant.technologies ||
    [];

  if (Array.isArray(skills)) {
    return skills
      .map((skill) =>
        String(skill).trim()
      )
      .filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

/**
 * Search participants by one or more skills.
 *
 * A participant is returned when at least one
 * requested skill matches.
 */
export const searchParticipantsBySkills = (
  participants = [],
  searchTerm = ""
) => {
  if (!Array.isArray(participants)) {
    return [];
  }

  const query = String(searchTerm)
    .trim()
    .toLowerCase();

  if (!query) {
    return participants;
  }

  const queries = query
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return participants.filter(
    (participant) => {
      const skills =
        getParticipantSkills(
          participant
        ).map((skill) =>
          skill.toLowerCase()
        );

      return queries.some((querySkill) =>
        skills.some(
          (skill) =>
            skill.includes(querySkill) ||
            querySkill.includes(skill)
        )
      );
    }
  );
};

/**
 * Find participants with a specific skill.
 */
export const findParticipantsBySkill = (
  participants = [],
  skill = ""
) => {
  const query = String(skill)
    .trim()
    .toLowerCase();

  if (!query) {
    return [];
  }

  return participants.filter(
    (participant) =>
      getParticipantSkills(
        participant
      ).some((item) =>
        item
          .toLowerCase()
          .includes(query)
      )
  );
};

/**
 * Add a participant to a team.
 */
export const addTeamMember = (
  team,
  participant
) => {
  if (!team || !participant) {
    return team;
  }

  const members = Array.isArray(
    team.members
  )
    ? team.members
    : [];

  const maxSize =
    Number(team.maxTeamSize) ||
    DEFAULT_MAX_TEAM_SIZE;

  if (members.length >= maxSize) {
    return team;
  }

  const alreadyMember =
    members.some(
      (member) =>
        member.id === participant.id
    );

  if (alreadyMember) {
    return team;
  }

  return {
    ...team,
    members: [
      ...members,
      {
        ...participant,
        joinedAt:
          participant.joinedAt ||
          new Date().toISOString(),
      },
    ],
  };
};

/**
 * Remove a participant from a team.
 */
export const removeTeamMember = (
  team,
  memberId
) => {
  if (!team) {
    return team;
  }

  return {
    ...team,
    members: (
      team.members || []
    ).filter(
      (member) =>
        member.id !== memberId
    ),
  };
};

/**
 * Get the number of available team slots.
 */
export const getAvailableTeamSlots = (
  team
) => {
  if (!team) {
    return 0;
  }

  const maxSize =
    Number(team.maxTeamSize) ||
    DEFAULT_MAX_TEAM_SIZE;

  const memberCount =
    Array.isArray(team.members)
      ? team.members.length
      : 0;

  return Math.max(
    0,
    maxSize - memberCount
  );
};

/**
 * Check whether a team is full.
 */
export const isTeamFull = (
  team
) => {
  return (
    getAvailableTeamSlots(team) === 0
  );
};

/**
 * Create a team invitation/request.
 */
export const createTeamRequest = ({
  teamId,
  participantId,
  participantName = "",
  role = "",
  invitedBy = null,
} = {}) => {
  return {
    id: generateRequestId(),
    teamId,
    participantId,
    participantName,
    role,
    invitedBy,
    status: "pending",
    createdAt:
      new Date().toISOString(),
    respondedAt: null,
  };
};

/**
 * Update a request status.
 */
export const updateTeamRequestStatus = (
  request,
  status
) => {
  if (!request) {
    return request;
  }

  const allowedStatuses = [
    "pending",
    "accepted",
    "rejected",
  ];

  if (!allowedStatuses.includes(status)) {
    return request;
  }

  return {
    ...request,
    status,
    respondedAt:
      status === "pending"
        ? null
        : new Date().toISOString(),
  };
};

/**
 * Get pending team requests.
 */
export const getPendingTeamRequests = (
  requests = []
) => {
  if (!Array.isArray(requests)) {
    return [];
  }

  return requests.filter(
    (request) =>
      request.status === "pending"
  );
};

/**
 * Get accepted team requests.
 */
export const getAcceptedTeamRequests = (
  requests = []
) => {
  if (!Array.isArray(requests)) {
    return [];
  }

  return requests.filter(
    (request) =>
      request.status === "accepted"
  );
};

/**
 * Check whether a participant has already
 * received a pending request.
 */
export const hasPendingTeamRequest = (
  requests = [],
  participantId
) => {
  return requests.some(
    (request) =>
      request.participantId ===
        participantId &&
      request.status === "pending"
  );
};

/**
 * Validate a team before submission.
 */
export const validateTeam = (
  team
) => {
  const errors = [];

  if (!team) {
    return {
      valid: false,
      errors: ["Team is required."],
    };
  }

  if (!team.name?.trim()) {
    errors.push(
      "Team name is required."
    );
  }

  const members = Array.isArray(
    team.members
  )
    ? team.members
    : [];

  if (members.length === 0) {
    errors.push(
      "At least one team member is required."
    );
  }

  const maxSize =
    Number(team.maxTeamSize) ||
    DEFAULT_MAX_TEAM_SIZE;

  if (members.length > maxSize) {
    errors.push(
      `Team cannot have more than ${maxSize} members.`
    );
  }

  const roles = getTeamRoles(team);

  if (roles.length > 0) {
    const memberRoles =
      members
        .map(
          (member) =>
            member.role
              ?.trim()
              .toLowerCase()
        )
        .filter(Boolean);

    const missingRoles =
      roles.filter(
        (role) =>
          !memberRoles.includes(
            role.toLowerCase()
          )
      );

    if (missingRoles.length > 0) {
      errors.push(
        `Missing required roles: ${missingRoles.join(
          ", "
        )}.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Find missing roles in a team.
 */
export const getMissingTeamRoles = (
  team
) => {
  const requiredRoles =
    getTeamRoles(team);

  const members = Array.isArray(
    team?.members
  )
    ? team.members
    : [];

  const memberRoles = members
    .map(
      (member) =>
        member.role
          ?.trim()
          .toLowerCase()
    )
    .filter(Boolean);

  return requiredRoles.filter(
    (role) =>
      !memberRoles.includes(
        role.toLowerCase()
      )
  );
};

/**
 * Calculate how well a participant's
 * skills match required team roles.
 */
export const calculateSkillMatch = (
  participant,
  requiredSkills = []
) => {
  const participantSkills =
    getParticipantSkills(
      participant
    ).map((skill) =>
      skill.toLowerCase()
    );

  const skills = Array.isArray(
    requiredSkills
  )
    ? requiredSkills
    : [requiredSkills];

  const normalizedRequired =
    skills
      .map((skill) =>
        String(skill)
          .trim()
          .toLowerCase()
      )
      .filter(Boolean);

  if (
    normalizedRequired.length === 0
  ) {
    return {
      matchedSkills: [],
      missingSkills: [],
      score: 0,
    };
  }

  const matchedSkills =
    normalizedRequired.filter(
      (requiredSkill) =>
        participantSkills.some(
          (skill) =>
            skill.includes(
              requiredSkill
            ) ||
            requiredSkill.includes(
              skill
            )
        )
    );

  const missingSkills =
    normalizedRequired.filter(
      (requiredSkill) =>
        !matchedSkills.includes(
          requiredSkill
        )
    );

  return {
    matchedSkills,
    missingSkills,
    score: Math.round(
      (matchedSkills.length /
        normalizedRequired.length) *
        100
    ),
  };
};

/**
 * Rank participants according to their
 * skill match with required skills.
 */
export const rankParticipantsBySkills = (
  participants = [],
  requiredSkills = []
) => {
  if (!Array.isArray(participants)) {
    return [];
  }

  return participants
    .map((participant) => ({
      ...participant,
      skillMatch:
        calculateSkillMatch(
          participant,
          requiredSkills
        ),
    }))
    .sort(
      (a, b) =>
        b.skillMatch.score -
        a.skillMatch.score
    );
};

/**
 * Get a team's current status.
 */
export const getTeamStatus = (
  team
) => {
  if (!team) {
    return "Unavailable";
  }

  if (isTeamFull(team)) {
    return "Full";
  }

  const validation =
    validateTeam(team);

  if (
    validation.valid
  ) {
    return "Ready";
  }

  return "Incomplete";
};

/**
 * Get a simple team summary.
 */
export const getTeamSummary = (
  team
) => {
  if (!team) {
    return {
      memberCount: 0,
      maxTeamSize:
        DEFAULT_MAX_TEAM_SIZE,
      availableSlots: 0,
      status: "Unavailable",
      requiredRoles: [],
      missingRoles: [],
    };
  }

  return {
    memberCount: Array.isArray(
      team.members
    )
      ? team.members.length
      : 0,

    maxTeamSize:
      Number(team.maxTeamSize) ||
      DEFAULT_MAX_TEAM_SIZE,

    availableSlots:
      getAvailableTeamSlots(team),

    status:
      getTeamStatus(team),

    requiredRoles:
      getTeamRoles(team),

    missingRoles:
      getMissingTeamRoles(team),
  };
};

/**
 * Generate a simple unique team ID.
 */
const generateTeamId = () => {
  return `team-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

/**
 * Generate a simple unique request ID.
 */
const generateRequestId = () => {
  return `request-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};