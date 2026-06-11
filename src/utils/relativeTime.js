const RELATIVE_TIME_FALLBACK = "—";

export function getRelativeTime(dateInput) {
  if (typeof dateInput === "number") return null;
  if (dateInput === null || dateInput === undefined) {
    return RELATIVE_TIME_FALLBACK;
  }
  if (typeof dateInput === "string" && dateInput.trim() === "") {
    return RELATIVE_TIME_FALLBACK;
  }
  const now = new Date();
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) return RELATIVE_TIME_FALLBACK;

  const diffMs = date - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffMs < 0) {
    if (Math.abs(diffSec) < 60) return "Just ended";
    if (Math.abs(diffMin) < 60)
      return `${Math.abs(diffMin)} minute${Math.abs(diffMin) !== 1 ? "s" : ""} ago`;
    if (Math.abs(diffHour) < 24)
      return `${Math.abs(diffHour)} hour${Math.abs(diffHour) !== 1 ? "s" : ""} ago`;
    if (Math.abs(diffDay) === 1) return "Yesterday";
    if (Math.abs(diffDay) < 30) return `${Math.abs(diffDay)} days ago`;
    return new Date(dateInput).toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (diffSec < 60) return "Starting soon";
  if (diffMin < 60) return `In ${diffMin} minute${diffMin !== 1 ? "s" : ""}`;
  if (diffHour < 24) return `In ${diffHour} hour${diffHour !== 1 ? "s" : ""}`;
  if (diffDay === 1) return "Tomorrow";
  if (diffDay < 7) return `In ${diffDay} days`;
  if (diffDay < 30)
    return `In ${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) !== 1 ? "s" : ""}`;

  return null;
}

export function getSmartDateLabel(dateInput, timeInput = "") {
  if (!dateInput) return "TBD";

  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) return "TBD";

  const relative = getRelativeTime(timeInput ? `${dateInput} ${timeInput}` : dateInput);

  if (relative) return relative;

  return new Date(timeInput ? `${dateInput} ${timeInput}` : dateInput).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// RELIABILITY ENHANCEMENT: Added automated Jest unit test coverage for past/future date offsets and singular/plural formats.

export function isPast(dateInput) {
  if (!dateInput) return false;
  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) return false;
  return parsed.getTime() < Date.now();
}

export function isFuture(dateInput) {
  if (!dateInput) return false;
  const parsed = new Date(dateInput);
  if (isNaN(parsed.getTime())) return false;
  return parsed.getTime() > Date.now();
}
