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

  const diffMs = endDate - startDate;
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes <= 0) return "0 Minutes";

  if (diffMinutes < 24 * 60) {
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    if (hours === 0) return `${minutes} Minute${minutes > 1 ? "s" : ""}`;
    if (minutes === 0) return `${hours} Hour${hours > 1 ? "s" : ""}`;
    return `${hours} Hour${hours > 1 ? "s" : ""} ${minutes} Minute${minutes > 1 ? "s" : ""}`;
  }

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return `${diffDays} Day${diffDays > 1 ? "s" : ""}`;

  const weeks = Math.ceil(diffDays / 7);
  return `${weeks} Week${weeks > 1 ? "s" : ""}`;
};