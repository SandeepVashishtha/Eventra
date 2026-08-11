/**
 * Registration Eligibility utilities.
 *
 * Supports:
 * - Age requirements
 * - Student / professional requirements
 * - Location restrictions
 * - Team-size requirements
 * - Required skills
 * - Organizer-defined conditions
 * - Individual requirement validation
 * - Complete eligibility summary
 */

export const ELIGIBILITY_REQUIREMENT_TYPES = {
  AGE: "age",
  STUDENT_PROFESSIONAL:
    "student-professional",
  LOCATION: "location",
  TEAM_SIZE: "team-size",
  SKILLS: "skills",
  CUSTOM: "custom",
};

/**
 * Normalize a value to a string.
 */
export const normalizeEligibilityValue = (
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
 * Convert a value into a safe array.
 */
export const toEligibilityArray = (
  value
) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  return [value];
};

/**
 * Get the user's age.
 *
 * Supports:
 * - user.age
 * - user.dateOfBirth
 * - user.dob
 */
export const getUserAge = (
  user = {}
) => {
  if (
    Number.isFinite(
      Number(user.age)
    )
  ) {
    return Number(user.age);
  }

  const dateOfBirth =
    user.dateOfBirth ||
    user.dob ||
    user.birthDate;

  if (!dateOfBirth) {
    return null;
  }

  const birthDate =
    new Date(dateOfBirth);

  if (
    Number.isNaN(
      birthDate.getTime()
    )
  ) {
    return null;
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() <
        birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 0 ? age : null;
};

/**
 * Get the user's student/professional status.
 */
export const getUserProfessionalStatus = (
  user = {}
) => {
  return normalizeEligibilityValue(
    user.studentProfessionalStatus ||
      user.professionalStatus ||
      user.status ||
      user.role ||
      user.userType
  ).toLowerCase();
};

/**
 * Get the user's location values.
 */
export const getUserLocations = (
  user = {}
) => {
  const values = [
    user.country,
    user.state,
    user.city,
    user.location,
  ];

  return values
    .flatMap((value) =>
      toEligibilityArray(value)
    )
    .map((value) =>
      normalizeEligibilityValue(
        value
      ).toLowerCase()
    )
    .filter(Boolean);
};

/**
 * Get the user's team size.
 */
export const getUserTeamSize = (
  user = {}
) => {
  const teamSize =
    user.teamSize ??
    user.currentTeamSize ??
    user.team?.size ??
    user.team?.members?.length;

  if (
    teamSize === null ||
    teamSize === undefined ||
    teamSize === ""
  ) {
    return null;
  }

  const numericSize =
    Number(teamSize);

  return Number.isFinite(
    numericSize
  )
    ? numericSize
    : null;
};

/**
 * Get the user's skills.
 */
export const getUserSkills = (
  user = {}
) => {
  const skills =
    user.skills ||
    user.requiredSkills ||
    user.skillSet ||
    [];

  return toEligibilityArray(
    skills
  )
    .map((skill) => {
      if (
        typeof skill ===
        "object"
      ) {
        return (
          skill.name ||
          skill.title ||
          ""
        );
      }

      return skill;
    })
    .map((skill) =>
      normalizeEligibilityValue(
        skill
      ).toLowerCase()
    )
    .filter(Boolean);
};

/**
 * Extract age requirement values.
 */
export const getAgeRequirements = (
  requirements = {}
) => {
  const age =
    requirements.age || {};

  const minAge =
    requirements.minAge ??
    age.min ??
    age.minimum;

  const maxAge =
    requirements.maxAge ??
    age.max ??
    age.maximum;

  return {
    minAge:
      minAge !== undefined &&
      minAge !== null &&
      minAge !== ""
        ? Number(minAge)
        : null,

    maxAge:
      maxAge !== undefined &&
      maxAge !== null &&
      maxAge !== ""
        ? Number(maxAge)
        : null,
  };
};

/**
 * Check age eligibility.
 */
export const checkAgeEligibility = (
  requirements = {},
  user = {}
) => {
  const {
    minAge,
    maxAge,
  } = getAgeRequirements(
    requirements
  );

  if (
    minAge === null &&
    maxAge === null
  ) {
    return {
      satisfied: true,
      message:
        "No age restriction specified.",
    };
  }

  const userAge =
    getUserAge(user);

  if (userAge === null) {
    return {
      satisfied: false,
      message:
        "Your age or date of birth is not available.",
    };
  }

  if (
    minAge !== null &&
    userAge < minAge
  ) {
    return {
      satisfied: false,
      message: `You must be at least ${minAge} years old.`,
    };
  }

  if (
    maxAge !== null &&
    userAge > maxAge
  ) {
    return {
      satisfied: false,
      message: `You must be ${maxAge} years old or younger.`,
    };
  }

  return {
    satisfied: true,
    message:
      "Your age satisfies the requirement.",
  };
};

/**
 * Extract student/professional requirements.
 */
export const getProfessionalRequirements = (
  requirements = {}
) => {
  const value =
    requirements.allowedRoles ||
    requirements.studentProfessional ||
    requirements.studentStatus ||
    requirements.professionalStatus;

  return toEligibilityArray(
    value
  )
    .map((item) => {
      if (
        typeof item ===
        "object"
      ) {
        return (
          item.id ||
          item.value ||
          item.name ||
          item.label ||
          ""
        );
      }

      return item;
    })
    .map((item) =>
      normalizeEligibilityValue(
        item
      ).toLowerCase()
    )
    .filter(Boolean);
};

/**
 * Check student/professional eligibility.
 */
export const checkProfessionalEligibility =
  (
    requirements = {},
    user = {}
  ) => {
    const allowed =
      getProfessionalRequirements(
        requirements
      );

    if (allowed.length === 0) {
      return {
        satisfied: true,
        message:
          "No student or professional restriction specified.",
      };
    }

    const userStatus =
      getUserProfessionalStatus(
        user
      );

    if (!userStatus) {
      return {
        satisfied: false,
        message:
          "Your student or professional status is not available.",
      };
    }

    const matches =
      allowed.some(
        (item) =>
          item ===
            userStatus ||
          item.includes(
            userStatus
          ) ||
          userStatus.includes(
            item
          )
      );

    return {
      satisfied: matches,
      message: matches
        ? "Your participant status satisfies the requirement."
        : `This event is limited to: ${allowed.join(
            ", "
          )}.`,
    };
  };

/**
 * Extract location requirements.
 */
export const getLocationRequirements = (
  requirements = {}
) => {
  const value =
    requirements.allowedLocations ||
    requirements.locations ||
    requirements.countries ||
    requirements.location;

  return toEligibilityArray(
    value
  )
    .map((item) => {
      if (
        typeof item ===
        "object"
      ) {
        return (
          item.name ||
          item.label ||
          item.country ||
          item.city ||
          ""
        );
      }

      return item;
    })
    .map((item) =>
      normalizeEligibilityValue(
        item
      ).toLowerCase()
    )
    .filter(Boolean);
};

/**
 * Check location eligibility.
 */
export const checkLocationEligibility =
  (
    requirements = {},
    user = {}
  ) => {
    const allowed =
      getLocationRequirements(
        requirements
      );

    if (allowed.length === 0) {
      return {
        satisfied: true,
        message:
          "No location restriction specified.",
      };
    }

    const userLocations =
      getUserLocations(user);

    if (
      userLocations.length === 0
    ) {
      return {
        satisfied: false,
        message:
          "Your location information is not available.",
      };
    }

    const matches =
      allowed.some((location) =>
        userLocations.some(
          (userLocation) =>
            userLocation ===
              location ||
            userLocation.includes(
              location
            ) ||
            location.includes(
              userLocation
            )
        )
      );

    return {
      satisfied: matches,
      message: matches
        ? "Your location satisfies the event restriction."
        : `This event is restricted to: ${allowed.join(
            ", "
          )}.`,
    };
  };

/**
 * Extract team-size requirements.
 */
export const getTeamSizeRequirements = (
  requirements = {}
) => {
  const teamSize =
    requirements.teamSize ||
    {};

  const min =
    requirements.minTeamSize ??
    teamSize.min ??
    teamSize.minimum;

  const max =
    requirements.maxTeamSize ??
    teamSize.max ??
    teamSize.maximum;

  return {
    min:
      min !== undefined &&
      min !== null &&
      min !== ""
        ? Number(min)
        : null,

    max:
      max !== undefined &&
      max !== null &&
      max !== ""
        ? Number(max)
        : null,
  };
};

/**
 * Check team-size eligibility.
 */
export const checkTeamSizeEligibility =
  (
    requirements = {},
    user = {}
  ) => {
    const {
      min,
      max,
    } =
      getTeamSizeRequirements(
        requirements
      );

    if (
      min === null &&
      max === null
    ) {
      return {
        satisfied: true,
        message:
          "No team-size restriction specified.",
      };
    }

    const teamSize =
      getUserTeamSize(user);

    if (teamSize === null) {
      return {
        satisfied: false,
        message:
          "Your current team size is not available.",
      };
    }

    if (
      min !== null &&
      teamSize < min
    ) {
      return {
        satisfied: false,
        message: `Your team must have at least ${min} members.`,
      };
    }

    if (
      max !== null &&
      teamSize > max
    ) {
      return {
        satisfied: false,
        message: `Your team cannot have more than ${max} members.`,
      };
    }

    return {
      satisfied: true,
      message:
        "Your team size satisfies the requirement.",
    };
  };

/**
 * Extract required skills.
 */
export const getRequiredSkills = (
  requirements = {}
) => {
  const skills =
    requirements.requiredSkills ||
    requirements.skills ||
    [];

  return toEligibilityArray(
    skills
  )
    .map((skill) => {
      if (
        typeof skill ===
        "object"
      ) {
        return (
          skill.name ||
          skill.title ||
          skill.label ||
          ""
        );
      }

      return skill;
    })
    .map((skill) =>
      normalizeEligibilityValue(
        skill
      ).toLowerCase()
    )
    .filter(Boolean);
};

/**
 * Check required skills.
 */
export const checkSkillsEligibility = (
  requirements = {},
  user = {}
) => {
  const requiredSkills =
    getRequiredSkills(
      requirements
    );

  if (
    requiredSkills.length === 0
  ) {
    return {
      satisfied: true,
      message:
        "No specific skills are required.",
      missingSkills: [],
    };
  }

  const userSkills =
    getUserSkills(user);

  const missingSkills =
    requiredSkills.filter(
      (requiredSkill) =>
        !userSkills.some(
          (userSkill) =>
            userSkill ===
              requiredSkill ||
            userSkill.includes(
              requiredSkill
            ) ||
            requiredSkill.includes(
              userSkill
            )
        )
    );

  return {
    satisfied:
      missingSkills.length === 0,

    message:
      missingSkills.length ===
      0
        ? "You have the required skills."
        : `Missing skills: ${missingSkills.join(
            ", "
          )}.`,

    missingSkills,
  };
};

/**
 * Evaluate organizer-defined conditions.
 *
 * Supported condition shapes:
 *
 * {
 *   id,
 *   label,
 *   description,
 *   required: true,
 *   satisfied: true
 * }
 *
 * or
 *
 * {
 *   check: (user) => boolean
 * }
 */
export const checkCustomConditions = (
  requirements = {},
  user = {}
) => {
  const conditions =
    requirements.conditions ||
    requirements.customConditions ||
    requirements.otherConditions ||
    [];

  if (
    !Array.isArray(
      conditions
    ) ||
    conditions.length === 0
  ) {
    return [];
  }

  return conditions.map(
    (condition, index) => {
      if (
        typeof condition ===
        "string"
      ) {
        return {
          id: `custom-${index}`,
          label: condition,
          satisfied: true,
          message:
            "Organizer-defined condition.",
        };
      }

      let satisfied = true;

      if (
        typeof condition?.check ===
        "function"
      ) {
        try {
          satisfied = Boolean(
            condition.check(
              user
            )
          );
        } catch {
          satisfied = false;
        }
      } else if (
        typeof condition?.isSatisfied ===
        "function"
      ) {
        try {
          satisfied = Boolean(
            condition.isSatisfied(
              user
            )
          );
        } catch {
          satisfied = false;
        }
      } else if (
        condition?.satisfied !==
        undefined
      ) {
        satisfied =
          Boolean(
            condition.satisfied
          );
      } else if (
        condition?.completed !==
        undefined
      ) {
        satisfied =
          Boolean(
            condition.completed
          );
      }

      return {
        id:
          condition?.id ||
          `custom-${index}`,

        label:
          condition?.label ||
          condition?.title ||
          "Additional requirement",

        description:
          condition?.description ||
          "",

        satisfied,

        message: satisfied
          ? "Requirement satisfied."
          : condition?.failureMessage ||
            condition?.message ||
            "This organizer-defined requirement is not satisfied.",
      };
    }
  );
};

/**
 * Get the status of one requirement.
 *
 * This function is used by
 * EventRegistrationEligibility.js.
 */
export const getRequirementStatus = (
  type,
  requirements = {},
  user = {}
) => {
  switch (type) {
    case ELIGIBILITY_REQUIREMENT_TYPES.AGE:
      return checkAgeEligibility(
        requirements,
        user
      );

    case ELIGIBILITY_REQUIREMENT_TYPES.STUDENT_PROFESSIONAL:
      return checkProfessionalEligibility(
        requirements,
        user
      );

    case ELIGIBILITY_REQUIREMENT_TYPES.LOCATION:
      return checkLocationEligibility(
        requirements,
        user
      );

    case ELIGIBILITY_REQUIREMENT_TYPES.TEAM_SIZE:
      return checkTeamSizeEligibility(
        requirements,
        user
      );

    case ELIGIBILITY_REQUIREMENT_TYPES.SKILLS:
      return checkSkillsEligibility(
        requirements,
        user
      );

    default:
      return {
        satisfied: true,
        message:
          "Requirement status could not be determined.",
      };
  }
};

/**
 * Build all standard requirement results.
 */
export const evaluateEligibilityRequirements =
  (
    requirements = {},
    user = {}
  ) => {
    const results = [];

    const hasAgeRequirement =
      requirements.minAge !==
        undefined ||
      requirements.maxAge !==
        undefined ||
      requirements.age;

    if (hasAgeRequirement) {
      results.push({
        id: "age",
        label:
          "Age requirement",
        ...checkAgeEligibility(
          requirements,
          user
        ),
      });
    }

    const professionalRequirements =
      getProfessionalRequirements(
        requirements
      );

    if (
      professionalRequirements.length >
      0
    ) {
      results.push({
        id:
          "student-professional",
        label:
          "Student / professional requirement",
        ...checkProfessionalEligibility(
          requirements,
          user
        ),
      });
    }

    const locationRequirements =
      getLocationRequirements(
        requirements
      );

    if (
      locationRequirements.length >
      0
    ) {
      results.push({
        id: "location",
        label:
          "Location requirement",
        ...checkLocationEligibility(
          requirements,
          user
        ),
      });
    }

    const teamRequirements =
      getTeamSizeRequirements(
        requirements
      );

    if (
      teamRequirements.min !==
        null ||
      teamRequirements.max !==
        null
    ) {
      results.push({
        id: "team-size",
        label:
          "Team-size requirement",
        ...checkTeamSizeEligibility(
          requirements,
          user
        ),
      });
    }

    const requiredSkills =
      getRequiredSkills(
        requirements
      );

    if (
      requiredSkills.length >
      0
    ) {
      results.push({
        id: "skills",
        label:
          "Required skills",
        ...checkSkillsEligibility(
          requirements,
          user
        ),
      });
    }

    const customResults =
      checkCustomConditions(
        requirements,
        user
      );

    results.push(
      ...customResults
    );

    return results;
  };

/**
 * Get failed requirements.
 */
export const getFailedEligibilityRequirements =
  (
    requirements = {},
    user = {}
  ) => {
    return evaluateEligibilityRequirements(
      requirements,
      user
    ).filter(
      (requirement) =>
        !requirement.satisfied
    );
  };

/**
 * Get satisfied requirements.
 */
export const getSatisfiedEligibilityRequirements =
  (
    requirements = {},
    user = {}
  ) => {
    return evaluateEligibilityRequirements(
      requirements,
      user
    ).filter(
      (requirement) =>
        requirement.satisfied
    );
  };

/**
 * Get complete eligibility summary.
 *
 * This function is used by
 * EventRegistrationEligibility.js.
 */
export const getEligibilitySummary = (
  requirements = {},
  user = {}
) => {
  const results =
    evaluateEligibilityRequirements(
      requirements,
      user
    );

  const failedRequirements =
    results.filter(
      (requirement) =>
        !requirement.satisfied
    );

  const satisfiedRequirements =
    results.filter(
      (requirement) =>
        requirement.satisfied
    );

  return {
    eligible:
      failedRequirements.length ===
      0,

    totalRequirements:
      results.length,

    satisfiedCount:
      satisfiedRequirements.length,

    failedCount:
      failedRequirements.length,

    requirements: results,

    satisfiedRequirements,

    failedRequirements,
  };
};

/**
 * Check whether a user is eligible.
 */
export const isUserEligibleForRegistration =
  (
    requirements = {},
    user = {}
  ) => {
    return getEligibilitySummary(
      requirements,
      user
    ).eligible;
  };

/**
 * Get a simple warning message.
 */
export const getEligibilityWarningMessage =
  (
    requirements = {},
    user = {}
  ) => {
    const summary =
      getEligibilitySummary(
        requirements,
        user
      );

    if (summary.eligible) {
      return "";
    }

    if (
      summary.failedCount ===
      1
    ) {
      return "You do not currently meet one event eligibility requirement.";
    }

    return `You do not currently meet ${summary.failedCount} event eligibility requirements.`;
  };

/**
 * Get missing skills from the
 * eligibility summary.
 */
export const getMissingRequiredSkills = (
  requirements = {},
  user = {}
) => {
  return checkSkillsEligibility(
    requirements,
    user
  ).missingSkills;
};

/**
 * Get eligibility progress.
 */
export const getEligibilityProgress = (
  requirements = {},
  user = {}
) => {
  const summary =
    getEligibilitySummary(
      requirements,
      user
    );

  if (
    summary.totalRequirements ===
    0
  ) {
    return 100;
  }

  return Math.round(
    (summary.satisfiedCount /
      summary.totalRequirements) *
      100
  );
};

/**
 * Validate eligibility before
 * registration begins.
 */
export const validateRegistrationEligibility =
  (
    requirements = {},
    user = {}
  ) => {
    const summary =
      getEligibilitySummary(
        requirements,
        user
      );

    return {
      valid:
        summary.eligible,

      eligible:
        summary.eligible,

      errors:
        summary.failedRequirements.map(
          (requirement) => ({
            id: requirement.id,
            label:
              requirement.label,
            message:
              requirement.message,
          })
        ),

      summary,
    };
  };

/**
 * Create a normalized eligibility
 * configuration.
 */
export const normalizeEligibilityRequirements =
  (
    requirements = {}
  ) => {
    return {
      minAge:
        requirements.minAge ??
        requirements.age?.min ??
        null,

      maxAge:
        requirements.maxAge ??
        requirements.age?.max ??
        null,

      allowedRoles:
        toEligibilityArray(
          requirements.allowedRoles ||
            requirements.studentProfessional ||
            requirements.studentStatus ||
            requirements.professionalStatus
        ),

      allowedLocations:
        toEligibilityArray(
          requirements.allowedLocations ||
            requirements.locations ||
            requirements.countries ||
            requirements.location
        ),

      minTeamSize:
        requirements.minTeamSize ??
        requirements.teamSize?.min ??
        null,

      maxTeamSize:
        requirements.maxTeamSize ??
        requirements.teamSize?.max ??
        null,

      requiredSkills:
        toEligibilityArray(
          requirements.requiredSkills ||
            requirements.skills
        ),

      conditions:
        Array.isArray(
          requirements.conditions
        )
          ? requirements.conditions
          : Array.isArray(
              requirements.customConditions
            )
          ? requirements.customConditions
          : [],
    };
  };