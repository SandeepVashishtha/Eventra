export const getEventDuration = (event) => {
  const startDate = event.startDate
    ? new Date(event.startDate)
    : new Date(event.date);

  if (!startDate || Number.isNaN(startDate.getTime())) {
    return "";
  }

  const endDate = event.endDate
    ? new Date(event.endDate)
    : null;

  if (!endDate || Number.isNaN(endDate.getTime())) {
    return "";
  }

  // Same start/end instant → no real duration; flag it explicitly.
  if (startDate.getTime() === endDate.getTime()) {
    return "Same Day";
  }

  // Compute the span from calendar-day boundaries (local date components
  // normalized to UTC midnight) instead of dividing raw milliseconds by
  // 86400000, so DST transitions never skew the result.
  const startOfDayMs = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const calendarDaySpan = Math.round(
    (startOfDayMs(endDate) - startOfDayMs(startDate)) / (1000 * 60 * 60 * 24)
  );

  const totalDays = Math.max(calendarDaySpan + 1, 1);

  if (totalDays <= 1) return "1 Day";
  if (totalDays < 7) return `${totalDays} Days`;

  const weeks = Math.ceil(totalDays / 7);
  return `${weeks} Week${weeks > 1 ? "s" : ""}`;
};