/**
 * Common skills available for event tagging.
 */
export const DEFAULT_SKILL_TAGS = [
  "React",
  "Python",
  "AI/ML",
  "Data Science",
  "Cybersecurity",
  "IoT",
  "UI/UX",
];

/**
 * Normalize a skill for comparison.
 */
export const normalizeSkill = (skill) => {
  if (!skill) {
    return "";
  }

  return String(skill)
    .trim()
    .toLowerCase();
};

/**
 * Get skill tags from an event.
 *
 * Supports:
 * - skills: ["React", "Python"]
 * - skillTags: ["React", "Python"]
 * - skills: "React, Python"
 */
export const getEventSkillTags = (
  event = {}
) => {
  if (!event || typeof event !== "object") {
    return [];
  }
  const value =
    event.skillTags ??
    event.skills ??
    event.eventSkills ??
    [];

  if (Array.isArray(value)) {
    return value
      .map((skill) =>
        String(skill).trim()
      )
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  }

  return [];
};

/**
 * Get normalized event skills.
 */
export const getNormalizedEventSkills = (
  event = {}
) => {
  return getEventSkillTags(event).map(
    normalizeSkill
  );
};

/**
 * Remove duplicate skills while preserving
 * their display format.
 */
export const normalizeSkillTags = (
  skills = []
) => {
  if (!Array.isArray(skills)) {
    return [];
  }

  const uniqueSkills = new Map();

  skills
    .map((skill) => String(skill).trim())
    .filter(Boolean)
    .forEach((skill) => {
      const normalized =
        normalizeSkill(skill);

      if (!uniqueSkills.has(normalized)) {
        uniqueSkills.set(
          normalized,
          skill
        );
      }
    });

  return Array.from(
    uniqueSkills.values()
  );
};

/**
 * Add a skill tag.
 */
export const addSkillTag = (
  skills = [],
  skill
) => {
  if (!skill || !String(skill).trim()) {
    return normalizeSkillTags(skills);
  }

  return normalizeSkillTags([
    ...skills,
    skill,
  ]);
};

/**
 * Remove a skill tag.
 */
export const removeSkillTag = (
  skills = [],
  skill
) => {
  const normalized =
    normalizeSkill(skill);

  return normalizeSkillTags(skills).filter(
    (item) =>
      normalizeSkill(item) !==
      normalized
  );
};

/**
 * Check whether a skill already exists.
 */
export const hasSkillTag = (
  skills = [],
  skill
) => {
  const normalized =
    normalizeSkill(skill);

  return normalizeSkillTags(skills).some(
    (item) =>
      normalizeSkill(item) ===
      normalized
  );
};

/**
 * Check whether an event contains a
 * selected skill.
 */
export const eventHasSkill = (
  event,
  skill
) => {
  const normalized =
    normalizeSkill(skill);

  if (!normalized) {
    return true;
  }

  return getNormalizedEventSkills(
    event
  ).includes(normalized);
};

/**
 * Check whether an event matches any of
 * the selected skills.
 */
export const eventMatchesAnySkill = (
  event,
  selectedSkills = []
) => {
  if (
    !Array.isArray(selectedSkills) ||
    selectedSkills.length === 0
  ) {
    return true;
  }

  return selectedSkills.some(
    (skill) =>
      eventHasSkill(event, skill)
  );
};

/**
 * Check whether an event matches all
 * selected skills.
 */
export const eventMatchesAllSkills = (
  event,
  selectedSkills = []
) => {
  if (
    !Array.isArray(selectedSkills) ||
    selectedSkills.length === 0
  ) {
    return true;
  }

  return selectedSkills.every(
    (skill) =>
      eventHasSkill(event, skill)
  );
};

/**
 * Filter events using skill tags.
 *
 * Default behavior matches events containing
 * at least one selected skill.
 */
export const filterEventsBySkills = (
  events = [],
  selectedSkills = [],
  matchMode = "any"
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  if (
    !Array.isArray(selectedSkills) ||
    selectedSkills.length === 0
  ) {
    return events;
  }

  if (matchMode === "all") {
    return events.filter((event) =>
      eventMatchesAllSkills(
        event,
        selectedSkills
      )
    );
  }

  return events.filter((event) =>
    eventMatchesAnySkill(
      event,
      selectedSkills
    )
  );
};

/**
 * Get all unique skill tags used across
 * a collection of events.
 */
export const getAvailableSkillTags = (
  events = []
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  const skills = [];

  events.forEach((event) => {
    skills.push(
      ...getEventSkillTags(event)
    );
  });

  return normalizeSkillTags(skills).sort(
    (a, b) =>
      a.localeCompare(b)
  );
};

/**
 * Get filter options by combining the
 * default skills with skills found in events.
 */
export const getSkillFilterOptions = (
  events = []
) => {
  return normalizeSkillTags([
    ...DEFAULT_SKILL_TAGS,
    ...getAvailableSkillTags(events),
  ]).sort((a, b) =>
    a.localeCompare(b)
  );
};

/**
 * Toggle a skill in a selected-skills list.
 */
export const toggleSkillTag = (
  selectedSkills = [],
  skill
) => {
  if (!skill) {
    return normalizeSkillTags(
      selectedSkills
    );
  }

  if (
    hasSkillTag(
      selectedSkills,
      skill
    )
  ) {
    return removeSkillTag(
      selectedSkills,
      skill
    );
  }

  return addSkillTag(
    selectedSkills,
    skill
  );
};

/**
 * Clear all selected skill filters.
 */
export const clearSkillFilters = () => {
  return [];
};

/**
 * Get skills shared between a user and
 * an event.
 */
export const getMatchingSkills = (
  userSkills = [],
  event
) => {
  const normalizedUserSkills =
    normalizeSkillTags(
      Array.isArray(userSkills)
        ? userSkills
        : []
    );

  const eventSkills =
    getEventSkillTags(event);

  return eventSkills.filter(
    (eventSkill) =>
      normalizedUserSkills.some(
        (userSkill) =>
          normalizeSkill(
            userSkill
          ) ===
          normalizeSkill(
            eventSkill
          )
      )
  );
};

/**
 * Calculate how well a user's skills
 * match an event's skill tags.
 */
export const calculateSkillMatch = (
  userSkills = [],
  event
) => {
  const eventSkills =
    getEventSkillTags(event);

  if (eventSkills.length === 0) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: [],
    };
  }

  const normalizedUserSkills =
    normalizeSkillTags(
      Array.isArray(userSkills)
        ? userSkills
        : []
    );

  const matchedSkills =
    eventSkills.filter(
      (eventSkill) =>
        normalizedUserSkills.some(
          (userSkill) =>
            normalizeSkill(
              userSkill
            ) ===
            normalizeSkill(
              eventSkill
            )
        )
    );

  const missingSkills =
    eventSkills.filter(
      (eventSkill) =>
        !matchedSkills.some(
          (matchedSkill) =>
            normalizeSkill(
              matchedSkill
            ) ===
            normalizeSkill(
              eventSkill
            )
        )
    );

  return {
    score: Math.round(
      (matchedSkills.length /
        eventSkills.length) *
        100
    ),
    matchedSkills,
    missingSkills,
  };
};

/**
 * Rank events according to how closely
 * they match a user's skills.
 */
export const rankEventsBySkillMatch = (
  events = [],
  userSkills = []
) => {
  if (!Array.isArray(events)) {
    return [];
  }

  return events
    .map((event) => ({
      ...event,
      skillMatch:
        calculateSkillMatch(
          userSkills,
          event
        ),
    }))
    .sort(
      (a, b) =>
        b.skillMatch.score -
        a.skillMatch.score
    );
  };

/**
 * Validate skill tags before saving an event.
 */
export const validateSkillTags = (
  skills = []
) => {
  const normalized =
    normalizeSkillTags(skills);

  const errors = [];

  if (normalized.length === 0) {
    errors.push(
      "At least one skill tag is required."
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    skills: normalized,
  };
};

/**
 * Get the number of skill tags on an event.
 */
export const getSkillTagCount = (
  event
) => {
  return getEventSkillTags(event)
    .length;
};