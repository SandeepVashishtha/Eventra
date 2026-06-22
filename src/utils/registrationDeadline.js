// Computes a "Registration Closing Soon" indicator for events whose
// registration deadline (`registrationEnd`) is approaching.
//
// The badge appears only while the deadline is within the next
// REGISTRATION_CLOSING_WINDOW_HOURS and has not yet passed, so it
// automatically hides once registration closes.

export const REGISTRATION_CLOSING_WINDOW_HOURS = 48;

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

// Resolve the registration deadline from an event, tolerating the few
// field names the codebase/data uses for it. Returns a valid Date or null.
const getRegistrationDeadlineDate = (event = {}) => {
  if (!event || typeof event !== "object") return null;

  // Falls back to "" (not null) so a single falsy check covers missing,
  // null, undefined and empty-string deadlines without a complex conditional.
  const raw =
    event.registrationEnd ??
    event.registrationDeadline ??
    event.registrationClose ??
    "";

  if (!raw) return null;

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

const pluralize = (value, unit) => `${value} ${unit}${value === 1 ? "" : "s"}`;

// Build the human-readable remaining-time label.
// Examples: "Registration closes in 12 hours", "Registration closes tomorrow".
const buildClosingLabel = (msRemaining) => {
  if (msRemaining < MS_PER_HOUR) {
    const minutes = Math.max(1, Math.round(msRemaining / MS_PER_MINUTE));
    return `Registration closes in ${pluralize(minutes, "minute")}`;
  }

  if (msRemaining < MS_PER_DAY) {
    const hours = Math.round(msRemaining / MS_PER_HOUR);
    return `Registration closes in ${pluralize(hours, "hour")}`;
  }

  const days = Math.round(msRemaining / MS_PER_DAY);
  if (days === 1) return "Registration closes tomorrow";
  return `Registration closes in ${pluralize(days, "day")}`;
};

// Returns the closing-soon state for an event. `isClosingSoon` is true only
// when the deadline is in the future and within the configured window.
// `now` is injectable for testing.
export const getRegistrationClosingInfo = (event = {}, now = Date.now()) => {
  const deadline = getRegistrationDeadlineDate(event);

  if (!deadline) {
    return { isClosingSoon: false, label: null, deadline: null, msRemaining: null };
  }

  const msRemaining = deadline.getTime() - now;
  const windowMs = REGISTRATION_CLOSING_WINDOW_HOURS * MS_PER_HOUR;

  // Already closed, or further out than the window -> no badge.
  if (msRemaining <= 0 || msRemaining > windowMs) {
    return { isClosingSoon: false, label: null, deadline, msRemaining };
  }

  return {
    isClosingSoon: true,
    label: buildClosingLabel(msRemaining),
    deadline,
    msRemaining,
  };
};
