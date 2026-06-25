export const getEventDuration = (event) => {
  const startDate = event.startDate ? new Date(event.startDate) : new Date(event.date);

  const endDate = event.endDate ? new Date(event.endDate) : null;

  if (!endDate || Number.isNaN(endDate.getTime())) {
    return "";
  }

  const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) return "1 Day";
  if (diffDays < 7) return `${diffDays} Days`;

  const weeks = Math.ceil(diffDays / 7);
  return `${weeks} Week${weeks > 1 ? "s" : ""}`;
};
