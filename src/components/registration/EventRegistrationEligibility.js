import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import EligibilityWarning from "./EligibilityWarning";

import {
  getEligibilitySummary,
  getRequirementStatus,
} from "../../utils/registrationEligibilityUtils";

const EventRegistrationEligibility = ({
  event = {},
  user = {},
  requirements = null,
  showWarning = true,
  collapsible = false,
  defaultExpanded = true,
  onEligibilityChange,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] =
    useState(defaultExpanded);

  const eligibilityRequirements =
    requirements ||
    event.eligibilityRequirements ||
    event.eligibility ||
    {};

  const summary = useMemo(() => {
    return getEligibilitySummary(
      eligibilityRequirements,
      user
    );
  }, [
    eligibilityRequirements,
    user,
  ]);

  useMemo(() => {
    onEligibilityChange?.(
      summary
    );
  }, [
    summary,
    onEligibilityChange,
  ]);

  const requirementItems =
    buildRequirementItems(
      eligibilityRequirements,
      user
    );

  return (
    <section
      className={`w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {/* Header */}
      <div className="border-b border-slate-200 p-5 dark:border-slate-700">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <ShieldCheck
                size={21}
                className="text-indigo-600 dark:text-indigo-400"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                Registration Eligibility
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Check the requirements before starting
                your registration.
              </p>
            </div>
          </div>

          {collapsible && (
            <button
              type="button"
              onClick={() =>
                setIsExpanded(
                  (current) => !current
                )
              }
              aria-expanded={isExpanded}
              aria-label={
                isExpanded
                  ? "Collapse eligibility requirements"
                  : "Expand eligibility requirements"
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
            >
              <ChevronDown
                size={17}
                className={`transition-transform ${
                  isExpanded
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>
          )}
        </div>

        <EligibilitySummary
          summary={summary}
        />
      </div>

      {(!collapsible || isExpanded) && (
        <div className="p-5">
          {/* Warning */}
          {showWarning &&
            !summary.eligible && (
              <EligibilityWarning
                failedRequirements={
                  summary.failedRequirements
                }
              />
            )}

          {/* Requirement list */}
          {requirementItems.length > 0 ? (
            <div className="space-y-3">
              {requirementItems.map(
                (item) => (
                  <RequirementRow
                    key={item.id}
                    {...item}
                  />
                )
              )}
            </div>
          ) : (
            <EmptyRequirements />
          )}
        </div>
      )}
    </section>
  );
};

/**
 * Build displayable requirement items.
 */
const buildRequirementItems = (
  requirements,
  user
) => {
  const items = [];

  if (
    requirements?.age ||
    requirements?.minAge !==
      undefined ||
    requirements?.maxAge !==
      undefined
  ) {
    items.push(
      createRequirementItem(
        "age",
        "Age requirement",
        getAgeDescription(
          requirements
        ),
        requirements,
        user
      )
    );
  }

  if (
    requirements?.studentProfessional ||
    requirements?.studentStatus ||
    requirements?.professionalStatus ||
    requirements?.allowedRoles
  ) {
    items.push(
      createRequirementItem(
        "student-professional",
        "Student / professional requirement",
        getProfessionalDescription(
          requirements
        ),
        requirements,
        user
      )
    );
  }

  if (
    requirements?.location ||
    requirements?.locations ||
    requirements?.allowedLocations ||
    requirements?.countries
  ) {
    items.push(
      createRequirementItem(
        "location",
        "Location requirement",
        getLocationDescription(
          requirements
        ),
        requirements,
        user
      )
    );
  }

  if (
    requirements?.teamSize ||
    requirements?.minTeamSize !==
      undefined ||
    requirements?.maxTeamSize !==
      undefined
  ) {
    items.push(
      createRequirementItem(
        "team-size",
        "Team-size requirement",
        getTeamSizeDescription(
          requirements
        ),
        requirements,
        user
      )
    );
  }

  if (
    requirements?.skills ||
    requirements?.requiredSkills
  ) {
    items.push(
      createRequirementItem(
        "skills",
        "Required skills",
        getSkillsDescription(
          requirements
        ),
        requirements,
        user
      )
    );
  }

  const customConditions =
    requirements?.conditions ||
    requirements?.customConditions ||
    requirements?.otherConditions;

  if (
    Array.isArray(
      customConditions
    )
  ) {
    customConditions.forEach(
      (condition, index) => {
        const conditionRequirement =
          typeof condition ===
          "string"
            ? {
                label: condition,
                description:
                  condition,
              }
            : condition;

        items.push(
          createCustomRequirementItem(
            `custom-${index}`,
            conditionRequirement,
            user
          )
        );
      }
    );
  }

  return items;
};

/**
 * Create a standard requirement item.
 */
const createRequirementItem = (
  id,
  label,
  description,
  requirements,
  user
) => {
  const status =
    getRequirementStatus(
      id,
      requirements,
      user
    );

  return {
    id,
    label,
    description,
    status,
  };
};

/**
 * Create a custom condition item.
 */
const createCustomRequirementItem = (
  id,
  condition,
  user
) => {
  let satisfied = true;

  if (
    typeof condition?.isSatisfied ===
    "function"
  ) {
    satisfied =
      Boolean(
        condition.isSatisfied(
          user
        )
      );
  } else if (
    condition?.required === true
  ) {
    satisfied =
      condition.completed ===
        true ||
      condition.satisfied ===
        true;
  }

  return {
    id,
    label:
      condition?.label ||
      condition?.title ||
      "Additional requirement",
    description:
      condition?.description ||
      condition?.label ||
      "Organizer-defined condition.",
    status: {
      satisfied,
      message: satisfied
        ? "Requirement satisfied"
        : "Requirement not satisfied",
    },
  };
};

/**
 * Eligibility summary.
 */
const EligibilitySummary = ({
  summary,
}) => {
  const eligible =
    Boolean(summary?.eligible);

  return (
    <div
      className={`mt-5 rounded-xl border p-4 ${
        eligible
          ? "border-green-200 bg-green-50 dark:border-green-900/40 dark:bg-green-900/10"
          : "border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-900/10"
      }`}
    >
      <div className="flex items-start gap-3">
        {eligible ? (
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-green-600 dark:text-green-400"
          />
        ) : (
          <CircleAlert
            size={19}
            className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
          />
        )}

        <div className="min-w-0">
          <p
            className={`text-sm font-bold ${
              eligible
                ? "text-green-700 dark:text-green-300"
                : "text-amber-700 dark:text-amber-300"
            }`}
          >
            {eligible
              ? "You appear to be eligible"
              : "Eligibility requirements need attention"}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {eligible
              ? "You can continue to the registration form."
              : `${
                  summary?.failedRequirements
                    ?.length || 0
                } requirement${
                  summary?.failedRequirements
                    ?.length === 1
                    ? ""
                    : "s"
                } currently need attention.`}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Individual requirement row.
 */
const RequirementRow = ({
  label,
  description,
  status,
}) => {
  const satisfied =
    Boolean(status?.satisfied);

  return (
    <div
      className={`rounded-xl border p-4 ${
        satisfied
          ? "border-slate-200 dark:border-slate-700"
          : "border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-900/10"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {satisfied ? (
            <CheckCircle2
              size={18}
              className="text-green-600 dark:text-green-400"
            />
          ) : (
            <XCircle
              size={18}
              className="text-red-600 dark:text-red-400"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              {label}
            </h3>

            <span
              className={`text-[10px] font-semibold ${
                satisfied
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {satisfied
                ? "Satisfied"
                : "Not satisfied"}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>

          {status?.message && (
            <p
              className={`mt-2 text-xs font-medium ${
                satisfied
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {status.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Empty state.
 */
const EmptyRequirements = () => {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
      <ShieldCheck
        size={25}
        className="mx-auto text-slate-400"
      />

      <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
        No eligibility restrictions listed
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        This event has not specified any additional
        registration eligibility requirements.
      </p>
    </div>
  );
};

/**
 * Age description.
 */
const getAgeDescription = (
  requirements
) => {
  const minAge =
    requirements?.minAge ??
    requirements?.age?.min;

  const maxAge =
    requirements?.maxAge ??
    requirements?.age?.max;

  if (
    minAge !== undefined &&
    maxAge !== undefined
  ) {
    return `Participants must be between ${minAge} and ${maxAge} years old.`;
  }

  if (
    minAge !== undefined
  ) {
    return `Participants must be at least ${minAge} years old.`;
  }

  if (
    maxAge !== undefined
  ) {
    return `Participants must be ${maxAge} years old or younger.`;
  }

  return (
    requirements?.age?.description ||
    "Check the event age requirements."
  );
};

/**
 * Student/professional description.
 */
const getProfessionalDescription = (
  requirements
) => {
  const allowed =
    requirements?.allowedRoles ||
    requirements?.studentProfessional ||
    requirements?.studentStatus ||
    requirements?.professionalStatus;

  if (
    Array.isArray(allowed) &&
    allowed.length > 0
  ) {
    return `Eligible participants: ${allowed.join(
      ", "
    )}.`;
  }

  if (
    typeof allowed ===
    "string"
  ) {
    return allowed;
  }

  return "Check whether the event is intended for students, professionals, or another participant group.";
};

/**
 * Location description.
 */
const getLocationDescription = (
  requirements
) => {
  const locations =
    requirements?.allowedLocations ||
    requirements?.locations ||
    requirements?.countries ||
    requirements?.location;

  if (
    Array.isArray(locations) &&
    locations.length > 0
  ) {
    return `Eligible locations: ${locations.join(
      ", "
    )}.`;
  }

  if (
    typeof locations ===
    "string"
  ) {
    return locations;
  }

  return "Check the organizer's location restrictions for this event.";
};

/**
 * Team size description.
 */
const getTeamSizeDescription = (
  requirements
) => {
  const min =
    requirements?.minTeamSize ??
    requirements?.teamSize?.min;

  const max =
    requirements?.maxTeamSize ??
    requirements?.teamSize?.max;

  if (
    min !== undefined &&
    max !== undefined
  ) {
    return `Teams must contain between ${min} and ${max} members.`;
  }

  if (
    min !== undefined
  ) {
    return `Teams must contain at least ${min} members.`;
  }

  if (
    max !== undefined
  ) {
    return `Teams can contain up to ${max} members.`;
  }

  return (
    requirements?.teamSize?.description ||
    "Check the organizer's team-size requirements."
  );
};

/**
 * Skills description.
 */
const getSkillsDescription = (
  requirements
) => {
  const skills =
    requirements?.requiredSkills ||
    requirements?.skills;

  if (
    Array.isArray(skills) &&
    skills.length > 0
  ) {
    return `Required skills: ${skills.join(
      ", "
    )}.`;
  }

  if (
    typeof skills ===
    "string"
  ) {
    return skills;
  }

  return "Check the event requirements for the skills expected from participants.";
};

export default EventRegistrationEligibility;