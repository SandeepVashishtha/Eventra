function normalizeEventDate(value) {
  if (!value) return null;

  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T00:00:00Z`
    : /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(value)
      ? `${value}Z`
      : value;
  const date = new Date(iso);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatEventDate(value, options = {}) {
  const date = normalizeEventDate(value);

  if (!date) return "Date TBD";

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
    ...options
  });
}

export function formatEventTime(value, options = {}) {
  const date = normalizeEventDate(value);

  if (!date) return "Time TBD";

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    ...options
  });
}
