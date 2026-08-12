export const ELIGIBILITY_REQUIREMENTS = [
  "age",
  "education",
  "location",
  "skills",
  "team",
  "category",
];

/**
 * Check whether the user's age is within
 * the event's allowed age range.
 */
export const checkAgeEligibility = (
  userAge,
  requirement = {}
) => {
  if (
    userAge === undefined ||
    userAge === null ||
    userAge === ""
  ) {
    return {
      eligible: false,
      reason: "Age information is required.",
    };
  }

  const age = Number(userAge);

  if (Number.isNaN(age)) {
    return {
      eligible: false,
      reason: "Invalid age.",
    };
  }

  const minAge =
    requirement.minAge ?? null;
  const maxAge =
    requirement.maxAge ?? null;

  if (
    minAge !== null &&
    age < Number(minAge)
  ) {
    return {
      eligible: false,
      reason: `Minimum age is ${minAge}.`,
    };
  }

  if (
    maxAge !== null &&
    age > Number(maxAge)
  ) {
    return {
      eligible: false,
      reason: `Maximum age is ${maxAge}.`,
    };
  }

  return {
    eligible: true,
    reason: "Age requirement satisfied.",
  };
};

/**
 * Check education eligibility.
 *
 * `allowedLevels` should contain the education
 * levels accepted by the event.
 */
export const checkEducationEligibility = (
  userEducation,
  allowedLevels = []
) => {
  if (!allowedLevels.length) {
    return {
      eligible: true,
      reason: "No education restriction.",
    };
  }

  if (!userEducation) {
    return {
      eligible: false,
      reason: "Education level is required.",
    };
  }

  const normalizedEducation =
    String(userEducation)
      .trim()
      .toLowerCase();

  const eligible = allowedLevels.some(
    (level) =>
      String(level)
        .trim()
        .toLowerCase() ===
      normalizedEducation
  );

  return {
    eligible,
    reason: eligible
      ? "Education requirement satisfied."
      : "Education level does not meet the event requirement.",
  };
};

/**
 * Check location eligibility.
 */
export const checkLocationEligibility = (
  userLocation,
  allowedLocations = []
) => {
  if (!allowedLocations.length) {
    return {
      eligible: true,
      reason: "No location restriction.",
    };
  }

  if (!userLocation) {
    return {
      eligible: false,
      reason: "Location is required.",
    };
  }

  const normalizedLocation =
    String(userLocation)
      .trim()
      .toLowerCase();

  const eligible = allowedLocations.some(
    (location) =>
      String(location)
        .trim()
        .toLowerCase() ===
      normalizedLocation
  );

  return {
    eligible,
    reason: eligible
      ? "Location requirement satisfied."
      : "Your location is not eligible for this event.",
  };
};

/**
 * Check required skills.
 *
 * Every required event skill must be
 * present in the user's skill list.
 */
export const checkSkillsEligibility = (
  userSkills = [],
  requiredSkills = []
) => {
  if (!requiredSkills.length) {
    return {
      eligible: true,
      reason: "No required skills.",
      missingSkills: [],
    };
  }

  const normalizedUserSkills =
    userSkills.map((skill) =>
      String(skill).trim().toLowerCase()
    );

  const missingSkills =
    requiredSkills.filter(
      (skill) =>
        !normalizedUserSkills.includes(
          String(skill)
            .trim()
            .toLowerCase()
        )
    );

  return {
    eligible: missingSkills.length === 0,
    reason:
      missingSkills.length === 0
        ? "Required skills satisfied."
        : `Missing required skills: ${missingSkills.join(
            ", "
          )}.`,
    missingSkills,
  };
};

/**
 * Check team-size requirements.
 */
export const checkTeamEligibility = (
  teamSize,
  requirement = {}
) => {
  if (
    requirement.minSize === undefined &&
    requirement.maxSize === undefined
  ) {
    return {
      eligible: true,
      reason: "No team-size restriction.",
    };
  }

  if (
    teamSize === undefined ||
    teamSize === null ||
    teamSize === ""
  ) {
    return {
      eligible: false,
      reason: "Team size is required.",
    };
  }

  const size = Number(teamSize);

  if (Number.isNaN(size)) {
    return {
      eligible: false,
      reason: "Invalid team size.",
    };
  }

  if (
    requirement.minSize !== undefined &&
    size < Number(requirement.minSize)
  ) {
    return {
      eligible: false,
      reason: `Minimum team size is ${requirement.minSize}.`,
    };
  }

  if (
    requirement.maxSize !== undefined &&
    size > Number(requirement.maxSize)
  ) {
    return {
      eligible: false,
      reason: `Maximum team size is ${requirement.maxSize}.`,
    };
  }

  return {
    eligible: true,
    reason: "Team requirement satisfied.",
  };
};

/**
 * Check participant category.
 */
export const checkCategoryEligibility = (
  userCategory,
  allowedCategories = []
) => {
  if (!allowedCategories.length) {
    return {
      eligible: true,
      reason: "No participant category restriction.",
    };
  }

  if (!userCategory) {
    return {
      eligible: false,
      reason: "Participant category is required.",
    };
  }

  const normalizedCategory =
    String(userCategory)
      .trim()
      .toLowerCase();

  const eligible = allowedCategories.some(
    (category) =>
      String(category)
        .trim()
        .toLowerCase() ===
      normalizedCategory
  );

  return {
    eligible,
    reason: eligible
      ? "Participant category accepted."
      : "Your participant category is not eligible for this event.",
  };
};

/**
 * Run all event eligibility checks.
 *
 * Expected structure:
 *
 * eventRequirements = {
 *   age: { minAge: 18, maxAge: 30 },
 *   education: { allowedLevels: ["Student", "Graduate"] },
 *   location: { allowedLocations: ["India"] },
 *   skills: { requiredSkills: ["JavaScript", "React"] },
 *   team: { minSize: 1, maxSize: 4 },
 *   category: { allowedCategories: ["Student"] }
 * }
 *
 * userProfile = {
 *   age: 21,
 *   education: "Student",
 *   location: "India",
 *   skills: ["JavaScript", "React"],
 *   teamSize: 2,
 *   category: "Student"
 * }
 */
export const checkEventEligibility = (
  userProfile = {},
  eventRequirements = {}
) => {
  const results = {
    age: checkAgeEligibility(
      userProfile.age,
      eventRequirements.age
    ),

    education:
      checkEducationEligibility(
        userProfile.education,
        eventRequirements.education
          ?.allowedLevels || []
      ),

    location:
      checkLocationEligibility(
        userProfile.location,
        eventRequirements.location
          ?.allowedLocations || []
      ),

    skills: checkSkillsEligibility(
      userProfile.skills || [],
      eventRequirements.skills
        ?.requiredSkills || []
    ),

    team: checkTeamEligibility(
      userProfile.teamSize,
      eventRequirements.team
    ),

    category:
      checkCategoryEligibility(
        userProfile.category,
        eventRequirements.category
          ?.allowedCategories || []
      ),
  };

  const eligible = Object.values(
    results
  ).every((result) => result.eligible);

  const failedRequirements =
    Object.entries(results)
      .filter(
        ([, result]) => !result.eligible
      )
      .map(([requirement, result]) => ({
        requirement,
        reason: result.reason,
      }));

  return {
    eligible,
    results,
    failedRequirements,
    checkedRequirements:
      Object.keys(results).length,
  };
};

/**
 * Get a simple eligibility message.
 */
export const getEligibilityMessage = (
  eligibilityResult
) => {
  if (!eligibilityResult) {
    return "Eligibility could not be determined.";
  }

  if (eligibilityResult.eligible) {
    return "You are eligible to participate in this event.";
  }

  return "You are not eligible to participate in this event.";
};